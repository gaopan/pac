// csv parser
export default {
  csvParserGenerator:(function() {
    var parser = {};
    // the csv text must have title in header, first row is the header
    // {
    //   valid: true,
    //   result: {...}, // null when valid equals false
    //   error: [{
    //     cause: 'CSV file content is empty.'
    //   },{
    //     row: 3,
    //     column: 4,
    //     cause: ''    
    //   }]
    // }
    //
    parser.parse = function(text, titleToField, lineDelimiter, columnDelimiter) {
      if (!text) {
        return {
          valid: false,
          error: [{
            cause: 'CSV file content is empty.'
          }]
        };
      }
      if (!lineDelimiter) {
        lineDelimiter = '\r';
      }
      if (!columnDelimiter) {
        columnDelimiter = ',';
      }
      var arr1 = text.split(lineDelimiter);
      var arrRes = { column: null, data: [] },
        objRes = [],
        valid = true,
        error = [];
      arr1.forEach(function(row, index) {
        var aColumn=null,aRow=null;
        if (index == 0) {
          aColumn = row.split(columnDelimiter);
          // TODO validate the empty name
          aColumn.forEach(function(d, columnIndex) {
            if (d.trim().length < 1) {
              valid = false;
              error.push({
                row: index,
                column: columnIndex,
                cause: 'Line ' + index + ', Column ' + columnIndex + ' should not be empty'
              });
            }
          });

          aColumn = aColumn.map(function(d) {
            if (d) {
              return d.trim();
            } else {
              return '';
            }
          });
          arrRes.column = aColumn;
        } else {
          aRow = row.split(columnDelimiter);
          // TODO validate empty name and column's length
          // if (aRow.length < aColumn.length) {
          //   valid = false;
          //   error.push({
          //     row: index,
          //     column: aRow.length - 1,
          //     cause: 'Line' + index + ', Column ' + columnIndex + ' missing'
          //   })
          // }
          aRow = aRow.map(function(d) { if (d) { return d.trim() } else { return ''; } });
          arrRes.data.push(aRow);
        }
      });

      if (!arrRes.column) {
        console.error("No title.");
        return;
      }

      // map column to field names
      var fieldNameAndColumnIndexMapping = {};
      arrRes.column.forEach(function(c, index) {
        fieldNameAndColumnIndexMapping[index] = titleToField[c];
      });

      arrRes.data.forEach(function(row) {
        var newObj = {};
        row.forEach(function(d, index) {
          newObj[fieldNameAndColumnIndexMapping[index]] = d;
        });
        objRes.push(newObj);
      });

      return {
        valid: valid,
        result: valid ? objRes : null,
        error: error
      };
    };
    return parser;
  })()
}

// let CSVParser = csvParserGenerator()

// export {
//  CSVParser
// }
