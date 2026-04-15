export function registerHandlebarsHelpers() {
  // Helper do sprawdzania zakresu liczbowego
  Handlebars.registerHelper("cogwheel-range", (v1, v2, v3) => (v1 >= v2) && (v1 <= v3));

  // Helper do zwiększania wartości o 1 (dla poziomów traum)
  Handlebars.registerHelper("cogwheel-inc", (value) => parseInt(value) + 1);

  // Helper do kapitalizacji pierwszej litery (używany w szablonach do kluczy tłumaczeń)
  Handlebars.registerHelper("cogwheel-capitalize", (str) => {
    if (typeof str !== "string") return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  });

  // Helper do generowania określonej liczby elementów (dla obrażeń atrybutów)
  // Iteruje od 0 do n włącznie, this = string (np. "0", "1") — zgodnie z StringField w DataModel
  Handlebars.registerHelper("cogwheel-times", function(n, options) {
    let result = "";
    for (let i = 0; i <= n; i++) {
      result += options.fn(String(i));
    }
    return result;
  });
}