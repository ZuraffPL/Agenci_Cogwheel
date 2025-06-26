export function registerHandlebarsHelpers() {
    Handlebars.registerHelper({
      eq: (v1, v2) => v1 === v2,
      ne: (v1, v2) => v1 !== v2,
      lt: (v1, v2) => v1 < v2,
      gt: (v1, v2) => v1 > v2,
      lte: (v1, v2) => v1 <= v2,
      gte: (v1, v2) => v1 >= v2,
      and() {
        return Array.prototype.every.call(arguments, Boolean);
      },
      or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
      },
      range:(v1, v2, v3)=> checkRange(v1, v2, v3)
    });
    Handlebars.registerHelper("lowercase", function (str) {
      return str.toLowerCase();
    });

function checkRange(v1, v2, v3){
  const ouput = (v1 >= v2)&&(v1 <= v3)
  return ouput
}

// Helper do zwiększania wartości o 1 (dla poziomów traum)
Handlebars.registerHelper('inc', function(value) {
  return parseInt(value) + 1;
});

// Helper do łączenia stringów (dla kluczy tłumaczeń)
Handlebars.registerHelper('concat', function() {
  return Array.prototype.slice.call(arguments, 0, -1).join('');
});

// Helper do kapitalizacji pierwszej litery
Handlebars.registerHelper('capitalize', function(str) {
  if (typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
});

// Helper do generowania range dla zegarów nemezis
Handlebars.registerHelper('range', function(start, current, max) {
  const result = [];
  for (let i = start; i <= Math.min(current, max); i++) {
    result.push(i);
  }
  return result;
});
}