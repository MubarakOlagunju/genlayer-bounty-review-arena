# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json

class BountyFactory(gl.Contract):
    factory_state: str

    def __init__(self):
        initial_state = {
            "next_id": 1,
            "bounties": {}
        }
        self.factory_state = json.dumps(initial_state)

    @gl.public.write
    def create_bounty(self, title: str, criteria: str, reward: int) -> int:
        # Changed to sender_address
        sender = gl.message.sender_address
        state = json.loads(self.factory_state)
        bounty_id = state["next_id"]
        
        state["bounties"][str(bounty_id)] = {
            "creator": str(sender), 
            "title": title,
            "criteria": criteria,
            "reward_amount": reward,
            "is_open": True,
            "winner_address": "",
            "winning_submission_url": ""
        }
        
        state["next_id"] += 1
        self.factory_state = json.dumps(state)
        
        return bounty_id

    @gl.public.write
    def evaluate_submission(self, bounty_id: int, submission_url: str) -> str:
        # Changed to sender_address
        sender = gl.message.sender_address
        state = json.loads(self.factory_state)
        bounty_id_str = str(bounty_id)
        
        if bounty_id_str not in state["bounties"]:
            raise gl.vm.UserError("Bounty ID does not exist.")
            
        bounty = state["bounties"][bounty_id_str]
        
        if not bounty["is_open"]:
            raise gl.vm.UserError("This bounty is already closed and paid out.")

        bounty_criteria = bounty["criteria"]

        def check_work() -> str:
            try:
                web_data = gl.nondet.web.render(submission_url, mode="text")
            except Exception:
                return json.dumps({
                    "meets_criteria": False,
                    "feedback": "Network Error: Could not read the submitted URL."
                })

            task = f"You are an AI evaluator for a Web3 developer bounty platform. Your task is to determine if the submitted work strictly meets the following criteria: '{bounty_criteria}'. SUBMITTED CONTENT: {web_data}. Respond strictly in JSON format."
            
            try:
                result = gl.nondet.exec_prompt(task).replace("```json", "").replace("```", "").strip()
                return result
            except Exception:
                return json.dumps({
                    "meets_criteria": False,
                    "feedback": "AI Engine Error: The evaluation failed."
                })

        result_json_str = gl.eq_principle.strict_eq(check_work)
        result_json = json.loads(result_json_str)

        if result_json.get("meets_criteria") == True:
            state["bounties"][bounty_id_str]["is_open"] = False
            state["bounties"][bounty_id_str]["winner_address"] = str(sender)
            state["bounties"][bounty_id_str]["winning_submission_url"] = submission_url
            
            self.factory_state = json.dumps(state)
            gl.contract.transfer(sender, u256(bounty["reward_amount"]))

        return result_json_str

    @gl.public.view
    def get_all_bounties(self) -> str:
        state = json.loads(self.factory_state)
        return json.dumps(state["bounties"])