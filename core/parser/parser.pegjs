whitespace
  = [ \t\n\r]

_ "whitespace"
  = whitespace*

digit
  = [0-9]

digits
  = digits:digit+ { return digits.join(''); }

