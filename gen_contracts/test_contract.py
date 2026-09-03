import pytest
import json
import builtins
from unittest.mock import MagicMock

# --- 1. MOCK THE GENLAYER ENVIRONMENT ---
mock_gl = MagicMock()
mock_gl.Contract = object  # Allows the contract class to inherit from gl.Contract

# Stop the decorators from hijacking the functions
def passthrough_decorator(func):
    return func

mock_gl.public.write = passthrough_decorator
mock_gl.public.view = passthrough_decorator

builtins.gl = mock_gl
builtins.u256 = int  # FIX: Tell Python to treat GenLayer's u256 as a standard integer

# --- 2. IMPORT THE CONTRACT ---
from bounty_contract import BountyFactory 

def test_accepted_submission_executes_payout():
    contract = BountyFactory()
    
    # Setup: Mint a new bounty with 500 tokens in escrow
    gl.message.sender_address = "creator_address"
    bounty_id = contract.create_bounty("Build Frontend", "React app needed", 500)
        
    state = json.loads(contract.factory_state)
    assert state["bounties"][str(bounty_id)]["reward_escrow"] == 500
    assert state["bounties"][str(bounty_id)]["is_open"] is True
    
    # Execution: Mock the AI returning an ACCEPTED verdict
    mock_result_str = json.dumps({"meets_criteria": True, "feedback": "Excellent work."})
    
    gl.message.sender_address = "developer_address"
    gl.eq_principle.strict_eq = MagicMock(return_value=mock_result_str)
    gl.contract.transfer = MagicMock()  
    
    # Trigger the evaluation
    contract.evaluate_submission(bounty_id, "https://github.com/user/repo")
        
    # Verification: Check finalized contract state and payout execution
    final_state = json.loads(contract.factory_state)
    bounty = final_state["bounties"][str(bounty_id)]
        
    assert bounty["is_open"] is False
    assert bounty["winner_address"] == "developer_address"
    assert bounty["reward_escrow"] == 0
        
    # Verify the transfer function was actually called to move the funds
    gl.contract.transfer.assert_called_once()

def test_rejected_submission_protects_escrow():
    contract = BountyFactory()
    
    # Setup: Mint a new bounty with 500 tokens
    gl.message.sender_address = "creator_address"
    bounty_id = contract.create_bounty("Build Frontend", "React app needed", 500)
        
    # Execution: Mock the AI returning a REJECTED verdict
    mock_result_str = json.dumps({"meets_criteria": False, "feedback": "Missing requirements."})
    
    gl.message.sender_address = "developer_address"
    gl.eq_principle.strict_eq = MagicMock(return_value=mock_result_str)
    gl.contract.transfer = MagicMock()
    
    # Trigger the evaluation
    contract.evaluate_submission(bounty_id, "https://github.com/user/repo")
        
    # Verification: Verify bounty remains open and funds remain locked
    final_state = json.loads(contract.factory_state)
    bounty = final_state["bounties"][str(bounty_id)]
        
    assert bounty["is_open"] is True
    assert bounty["winner_address"] == ""
    assert bounty["reward_escrow"] == 500
        
    # Verify NO transfer occurred
    gl.contract.transfer.assert_not_called()