-- The admin OTP threshold no longer gates anything: every cash-out and
-- transfer needs the customer's own approval. AgentSettings held only it.
DROP TABLE "AgentSettings";
