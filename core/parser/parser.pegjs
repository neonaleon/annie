// Notes
// $ expression returns the matched string instead of the matched result

// Credits
// reltime function taken from https://github.com/rsdoiel/reltime/blob/master/reltime.js
// many of the input types were written with reference to https://github.com/square/cube/blob/master/lib/cube/metric-expression.peg

// initialization block
{
  var padZero = function(num, pad){
    pad = pad || 0;
    var toPad = pad - num.toString().length;
    var retval = num;
    for (var i = 0; i < toPad; ++i){
      retval = '0' + retval;
    }
    return retval;
  }

  var reltime = function (date_object, time_notation) {
    /* toks maps units to milliseconds scaling value */
    var toks = {
        /* 24*60*60*1000 */
        d: 86400000,
        dy: 86400000,
        day: 86400000,
        days: 86400000,
        /* 60*60*1000 */
        h: 3600000,
        hr: 3600000,
        hour: 3600000,
        hours: 3600000,
        /* 60*1000 */
        m: 60000,
        min: 60000,
        minute: 60000,
        minutes: 60000,
        /* 1000 */
        s: 1000,
        sec: 1000,
        secs: 1000,
        second: 1000,
        seconds: 1000
      },
      result = date_object.valueOf(),
      tokens = time_notation.toLowerCase().split(" "),
      val = 0,
      scale = 1,
      tok,
      i = 0,
      j = 0,
      cur = -1;

    for (i = 0; i < tokens.length; i += 1) {
      tok = false;
      if (Number(tokens[i])) {
        val = tokens[i];
      } else {
        cur = tokens[i].match(/[a-z]/);
        if (cur) {
          j = cur.index;
          tok = tokens[i].substr(j);
          if (j > 0) {
            val = tokens[i].substr(0, j);
          }
        } else {
          tok = tokens[i];
        }

        if (tok && val) {
          scale = toks[tok];
          result += val * scale;
          val = 0;
          tok = false;
        }
      }
    }
    return new Date(result);
  };
}

// parser start
start =
  Primary

Primary =
  'event(' _ event:String _ ')' pipeline:('.' PipelineStep)* ('.' exec:TerminalStep) {
    var query = {};
    query.event = event;
    query.pipeline = pipeline.map(function(d){ return d[1]; });
    query.exec = exec;
    return query;
  }

// Pipeline steps

PipelineStep =
  Where / From / To / Group / Sort

Where =
  'where(' _ obj:ObjectLiteral _ ')' { return { $match: obj }; }

From =
  'from(' _ ts:Timestamp _ ')' { return { $match: { timestamp: { $gte: ts } } }; }

To =
  'to(' _ ts:Timestamp _ ')' { return { $match: { timestamp: { $lte: ts } } }; }

Group =
  'group(' _ obj:ObjectLiteral _ ')' { return { $group: obj }; }

Sort =
  'sort(' _ obj:ObjectLiteral _ ')' { return { $sort: obj }; }

// Terminal step to end the expression

TerminalStep =
  Count / Sum / Average / Tabulate / Chart

Count =
  'count()' {
    return {
      append: [{ $group: { _id: null, value: { $sum: 1 } } }],
      options: {
        type: 'value',
        subtype: null,
        labels: null
      }
    };
  }

Sum =
  'sum()' {
    return {
      append: [{ $group: { _id: null, value: { $avg: '$something' } } }],
      options: {
        type: 'value',
        subtype: null,
        labels: null
      }
    };
  }

Average =
  'average()' {
    return {
      append: [{ $group: { _id: null, value: { $avg: '$something' } } }],
      options: {
        type: 'value',
        subtype: null,
        labels: null
      }
    };
  }

Tabulate =
  'tabulate(' _ first:String rest:(',' _ String)* _ ')' {
    return {
      append: null,
      options: {
        type: 'table',
        subtype: null,
        labels: [first].concat(rest.map(function(d){ return d[2]; }))
      }
    };
  }

Chart =
  'chart(' _ type:ChartType _ ')' {
    return {
      append: null,
      options: {
        type: 'chart',
        subtype: type,
        labels: []
      }
    };
  }

ChartType =
  '"' $('line' / 'pie' / 'bar') '"'
  / "'" $('line' / 'pie' / 'bar') "'"


// valid inputs

Timestamp =
  '"' ts:TimestampFormat '"' { return new Date(ts); }
  / "'" ts:TimestampFormat "'" { return new Date(ts); }
  / '"' ts:RelativeTimestampFormat '"' { return reltime(new Date(), ts); }
  / "'" ts:RelativeTimestampFormat "'" { return reltime(new Date(), ts); }

TimestampFormat =
  $Datetime
  / time:Time {
    var date = new Date();
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + padZero(date.getDay(), 2) + ' ' + time;
  }
  / $Date

RelativeTimestampFormat =
  $RelativeDatetime

RelativeDatetime =
  $(RelativeDays? _ RelativeMinutes? _ RelativeSeconds?)

RelativeDays =
  $('-'? Int 'd') / $('+'? Int 'd')

RelativeMinutes =
  $('-'? Int 'm') / $('+'? Int 'm')

RelativeSeconds =
  $('-'? Int 's') / $('+'? Int 's')

Datetime =
  date:Date Whitespace+ time:Time { return date + ' ' + time; }

Date =
  datestring:(YYYY '-' MM '-' DD) {
    var date = new Date(datestring.join(''));
    if (isNaN(date)) return error("Invalid Date - " + datestring);
    return datestring;
  }

DD =
  $('0'[0-9])
  / $('1'[0-9])
  / $('2'[0-9])
  / $('3'[0-1])

MM =
  $('0'[0-9])
  / $('1'[0-2])

YYYY =
  $([0-9][0-9][0-9][0-9])

Time =
  $(HH ':' mm ':' ss)

HH =
  $('0'[0-9])
  / $('1'[0-9])
  / $('2'[0-3])

mm =
  $([0-5][0-9])

ss =
  $([0-5][0-9])

// boilerplate

Literal =
  ObjectLiteral
  / ArrayLiteral
  / String
  / Number
  / 'true' { return true; }
  / 'false' { return false; }

ObjectLiteral =
  '{' _ first:KeyValuePair rest:(_ ',' _ KeyValuePair)* _ '}' {
    var obj = {};
    ([first].concat(rest.map(function(d) { return d[3]; }))).forEach(function(pair){
      obj[pair.key] = pair.value;
    });
    return obj;
  }
  / '{' _ '}' { return {}; }

KeyValuePair =
  key:(Identifier / String) _ ':' _ value:Literal { return { key:key, value:value }; }

ArrayLiteral =
  '[' _ first:Literal rest:(_ ',' _ Literal)* _ ']' { return [first].concat(rest.map(function(d) { return d[3]; })); }
  / '[' _ ']' { return []; }

Identifier =
  $([a-zA-Z_$][0-9a-zA-Z_$]*)

String =
  '"' chars:DoubleStringChar* '"' { return chars.join(""); }
  / "'" chars:SingleStringChar* "'" { return chars.join(""); }

DoubleStringChar =
  !('"' / "\\") char_:. { return char_; }

SingleStringChar =
  !("'" / "\\") char_:. { return char_; }

Whitespace =
  [ \t\n\r]

_ =
  Whitespace*

Number =
  number:Int { return parseInt(number, 10); }

Int =
  $(Digit19 Digits)
  / $Digit

Digit =
  [0-9]

Digit19 =
  [1-9]

Digits =
  $(Digit+)