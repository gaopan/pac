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
  "Customization Company": {
    rolesRequired: ["admin", "boss", "aa"]
  },
  "Customization Dashboard": {
    rolesRequired: ["admin", "aa", "boss"]
  },
  "Customization Project": {
    rolesRequired: ["admin", "boss", "aa"]
  }
}
