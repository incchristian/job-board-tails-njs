use aiken/builtin.{Blake2b_224, Hash}
use aiken/list
use aiken/transaction.{ScriptContext, Spend}
use aiken/transaction/credential.{VerificationKey}

type AssignmentDatum {
  assignment_id: Int,
  employer: Hash<Blake2b_224, VerificationKey>,
  recruiter: Hash<Blake2b_224, VerificationKey>,
  job_id: Int,
  payment_amount: Int,
  status: Int,
  created_at: Int,
}

type AssignmentRedeemer {
  AcceptAssignment
  CompleteAssignment
  CancelAssignment
}

validator job_assignment {
  spend(datum: AssignmentDatum, redeemer: AssignmentRedeemer, context: ScriptContext) -> Bool {
    when context.purpose is {
      Spend(_) -> {
        when redeemer is {
          AcceptAssignment -> datum.status == 0
          CompleteAssignment -> datum.status == 1
          CancelAssignment -> datum.status == 0
        }
      }
      _ -> False
    }
  }
}