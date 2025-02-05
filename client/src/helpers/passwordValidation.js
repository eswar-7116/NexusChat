export function isPassNotValid(password) {
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    
    if (password.search(/[a-zA-Z]/) === -1)
      return "Password must contain at least one alphabet";

    if (password.search(/\d/) === -1)
      return "Password must contain at least one number";

    return "";
}