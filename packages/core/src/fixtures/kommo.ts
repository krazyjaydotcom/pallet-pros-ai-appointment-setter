export const mockKommoIncomingInstagramMessage = {
  lead: {
    event: {
      id: "evt_123",
      type: "chat",
      created_at: 1780000000,
      chat: {
        conversation_id: "conv_123",
        contact_id: "contact_456",
        lead_id: "lead_789",
        channel: "instagram"
      },
      message: {
        id: "msg_123",
        direction: "incoming",
        text: "How much do I need to start?",
        created_at: 1780000000
      }
    }
  },
  account: {
    id: "acct_123"
  }
};

export const mockKommoOutgoingLoopEvent = {
  lead: {
    event: {
      id: "evt_124",
      type: "chat",
      message: {
        id: "msg_out_123",
        direction: "outgoing",
        text: "Here is the link",
        created_at: 1780000001
      }
    }
  }
};
