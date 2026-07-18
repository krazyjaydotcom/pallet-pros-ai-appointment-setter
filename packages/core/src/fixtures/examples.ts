export const sampleApprovedExamples = [
  {
    id: "ex_qualified_city_state",
    prospectMessage: "How much do I need to start?",
    conversationContext: "Prospect is interested and asking startup questions.",
    leadStage: "qualifying",
    prospectAttributes: {
      city: null,
      state: null,
      has_truck: null,
      has_trailer: null,
      watched_training: null,
      appointment_interest: null
    },
    approvedResponse: "What city and state are you in?",
    explanation: "This is short, clarifying, and moves the conversation toward qualification.",
    tags: ["qualifying", "startup"],
    priority: 100,
    active: true
  }
];
