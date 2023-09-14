use colored::*;

pub fn error_message(message: &str) -> String {
  format!("{} {}", "[X]".red(), message)
}

pub fn success_message(message: &str) -> String {
  format!("{} {}", "[✓]".green(), message)
}