export interface AutomationComponent {
  label: string;
  icon: string;
  node_type: string;
  subtext: string; // Added subtext property
  data?: Record<string, unknown>;
}

export const COMPONENTS_LIST: AutomationComponent[] = [
  {
    label: "Message Types",
    icon: "/automation/message_type.svg",
    node_type: "message",
    subtext: "Select different types of messages from the list."
  },
  {
    label: "Contact Form",
    icon: "/automation/contact-form.svg",
    node_type: "contactForm",
    subtext: "Connect a contact form to fill up the contact details from user."
  },
  {
    label: "Decision Button",
    icon: "/automation/notification-circle.svg",
    node_type: "decisionButton",
    subtext: "Decision buttons show quick action choices under the input for instant selection."
  },
  {
    label: "Agent Transfer",
    icon: "/automation/agent_transfer.svg",
    node_type: "agentTransfer",
    subtext: "Automatically transfers the conversation to most suitable agent."
  },
  {
    label: "Assign Agent",
    icon: "/automation/user-cirlce-addB.svg",
    node_type: "assignAgent",
    subtext: "This assigns an agent based on the selected staff and allows manual agent assignment."
  },
  {
    label: "Delay",
    icon: "/automation/delay.svg",
    node_type: "delay",
    subtext: "Adds a pause before the next message or action is executed."
  },
  {
    label: "Decision Card",
    icon: "/automation/sliderB.svg",
    node_type: "decisionCard",
    subtext: "Allows adding multiple decision cards, each with multiple selectable options."
  },
  {
    label: "Add Tag",
    icon: "/automation/tagB.svg",
    node_type: "tagAssign",
    subtext: "Adds a tag to the visitor for identification and tracking."
  },
  {
    label: "Randomize",
    icon: "/automation/randomizeB.svg",
    node_type: "randomize",
    subtext: "Distribute users across different paths for A/B testing."
  },
  {
    label: "Go To Step",
    icon: "/automation/gotostepB.svg",
    node_type: "goToStep",
    subtext: "Jump to a specific step or block in your automation flow."
  },
  {
    label: "Default Fallback",
    icon: "/automation/fallbackB.svg",
    node_type: "defaultFallback",
    subtext: "Executes when no other conditions or keywords are matched."
  },
  {
    label: "Close Chat",
    icon: "/automation/closeB.svg",
    node_type: "closeChat",
    subtext: "Ends the current chat session automatically."
  },
  // {
  //   label: "AI Assist",
  //   icon: "/automation/closeB.svg",
  //   node_type: "aiAssist",
  //   subtext: "Uses AI to handle complex queries and assist the visitor."
  // },
  {
    label: "API Call",
    icon: "/automation/apiB.svg",
    node_type: "apiCall",
    subtext: "Integrate with external services by sending or receiving data."
  },
  {
    label: "Send Form",
    icon: "/automation/formB.svg",
    node_type: "sendForm",
    subtext: "Send a structured form to collect specific user information."
  },
  {
    label: "User Input",
    icon: "/automation/inputB.svg",
    node_type: "userInput",
    subtext: "Wait for and capture a free-text response from the visitor."
  },
{
  label: "FAQ's",
  icon: "/automation/FaqB.svg",
  node_type: "faq",
  subtext: "Reply automatically using keyword-based answers."
},
{
  label: "Question",
  icon: "/automation/message-questionB.svg",
  node_type: "question",
  subtext: "Ask the visitor a question and capture their response."
},
  // {
  //   label: "Chat Options",
  //   icon: "/automation/chat_options.svg",
  //   node_type: "chatOptions",
  //   subtext: "Configure behavior and settings for the active chat."
  // },
  // {
  //   label: "Condition Router",
  //   icon: "/automation/condition_router.svg",
  //   node_type: "conotion",
  //   subtext: "Route users to different paths based on specific logic or data."
  // }
];
