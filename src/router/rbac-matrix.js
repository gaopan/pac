// all roles:["sales", "admin", "leap_practitioner", "customer_leadership", "customer_practitioner", "customer_general_participant", "leap_raas_admin", "leap_raas_operator", "customer_raas_operator", "leap_support", "leap_account_owner"]
export default {
  "Login": {
    rolesRequired: []
  },
  "Register": {
    rolesRequired: []
  },
  "Forgot Password": {
    rolesRequired: []
  },
  "Process Discovery/Process Explorer": {
    rolesRequired: ["admin", "leap_practitioner", "customer_leadership", "customer_practitioner", "customer_general_participant", "leap_raas_admin", "leap_raas_operator", "customer_raas_operator", "leap_account_owner"]
  },
  "Selection": {
    rolesRequired: ["admin", "leap_practitioner", "customer_leadership", "customer_practitioner", "customer_general_participant", "leap_raas_operator", "customer_raas_operator", "leap_raas_admin", "leap_account_owner"]
  },
  "Customization Dashboard": {
    rolesRequired: ["admin", "leap_practitioner", "customer_leadership", "customer_practitioner", "customer_general_participant", "leap_raas_operator", "customer_raas_operator", "leap_raas_admin", "leap_account_owner"]
  }
}
