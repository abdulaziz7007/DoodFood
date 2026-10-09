// Real food photos from Wikimedia Commons (free licenses). Each entry is the path under BASE.
const BASE = "https://thumb.wikimedia.org/wikipedia/commons/thumb/";
const P = (p: string) => BASE + p;

const I = {
  shawarma: [
    "8/8e/Chicken_Shawarma_Wrap_-_Lavash_2024-09-11.jpg/500px-Chicken_Shawarma_Wrap_-_Lavash_2024-09-11.jpg",
    "5/5d/Handmade_Chicken_Shawarma_Wrap_-_Lavash.jpg/500px-Handmade_Chicken_Shawarma_Wrap_-_Lavash.jpg",
  ],
  doner: [
    "a/aa/D%C3%B6ner_Kebab%2C_Berlin%2C_2010_%2801%29.jpg/500px-D%C3%B6ner_Kebab%2C_Berlin%2C_2010_%2801%29.jpg",
    "b/b7/D%C3%B6ner_Kebab_Wrap_-_What_The_Pitta.jpg/500px-D%C3%B6ner_Kebab_Wrap_-_What_The_Pitta.jpg",
  ],
  burger: ["0/07/Hamburger_-_1.jpg/500px-Hamburger_-_1.jpg"],
  cheeseburger: ["4/4d/Cheeseburger.jpg/500px-Cheeseburger.jpg", "5/55/Cheese_Burger_-_Las_Vegas.jpg/500px-Cheese_Burger_-_Las_Vegas.jpg"],
  pizza: [
    "e/e4/Nice_pepperoni_pizza.jpg/500px-Nice_pepperoni_pizza.jpg",
    "4/46/Pepperoni_pizza_slice_on_a_red_plate.jpg/500px-Pepperoni_pizza_slice_on_a_red_plate.jpg",
    "8/8a/Pepperoni_pizza-_boella_co._2024-02-17.jpg/500px-Pepperoni_pizza-_boella_co._2024-02-17.jpg",
    "3/30/Pepperoni_Pizza_from_Fellini%E2%80%99s_Pizza.jpg/500px-Pepperoni_Pizza_from_Fellini%E2%80%99s_Pizza.jpg",
  ],
  hotdog: ["b/b6/Hot_dog_gourmet.jpg/500px-Hot_dog_gourmet.jpg", "a/ad/Hot_dog_01.jpg/500px-Hot_dog_01.jpg"],
  fries: [
    "9/95/Plate_of_chips_at_the_Chalet_Cafe%2C_Cowfold%2C_West_Sussex%2C_England.jpg/500px-Plate_of_chips_at_the_Chalet_Cafe%2C_Cowfold%2C_West_Sussex%2C_England.jpg",
    "8/8e/Truffle_oil_french_fries_%2833024792848%29.jpg/500px-Truffle_oil_french_fries_%2833024792848%29.jpg",
    "1/19/Cajun_fries_from_Popeyes_Louisiana_Kitchen%2C_Stratford%2C_Ontario%2C_2025-08-04.jpg/500px-Cajun_fries_from_Popeyes_Louisiana_Kitchen%2C_Stratford%2C_Ontario%2C_2025-08-04.jpg",
  ],
  nuggets: ["6/64/Chicken_Nuggets.jpg/500px-Chicken_Nuggets.jpg", "6/65/Chicken_nuggets_on_a_plate.jpg/500px-Chicken_nuggets_on_a_plate.jpg"],
  strips: ["8/8b/Chicken_fingers_and_fries.jpg/500px-Chicken_fingers_and_fries.jpg", "2/21/Crispy_Chicken_Strips_-_FotoosVanRobin.jpg/500px-Crispy_Chicken_Strips_-_FotoosVanRobin.jpg"],
  caesar: ["2/23/Caesar_salad_%282%29.jpg/500px-Caesar_salad_%282%29.jpg"],
  greek: ["7/7a/Greek_Salad_from_Thessaloniki.jpg/500px-Greek_Salad_from_Thessaloniki.jpg"],
  slaw: ["d/de/Bowl%27o%27Coleslaw_modified.jpg/500px-Bowl%27o%27Coleslaw_modified.jpg"],
  mojito: [
    "f/ff/Virgin_Mojito_01.jpg/500px-Virgin_Mojito_01.jpg",
    "6/69/Virgin_Mojito_02.jpg/500px-Virgin_Mojito_02.jpg",
    "1/13/Fresh_Mojito_Premium.jpg/500px-Fresh_Mojito_Premium.jpg",
  ],
  icedtea: ["6/6a/Iced_tea_with_ice_cubes.jpg/500px-Iced_tea_with_ice_cubes.jpg"],
  cola: ["e/ef/Coca-Cola_glass_bottle.jpg/500px-Coca-Cola_glass_bottle.jpg"],
  tea: ["8/8a/Cup_of_black_tea.JPG/500px-Cup_of_black_tea.JPG"],
  latte: ["6/61/Latte_macchiato_with_coffee_beans.jpg/500px-Latte_macchiato_with_coffee_beans.jpg", "a/ac/Latte_at_firefly_coffee_house.jpg/500px-Latte_at_firefly_coffee_house.jpg"],
  cappuccino: ["3/3f/Classical_Cappuccino_in_Savour_Cafe.jpg/500px-Classical_Cappuccino_in_Savour_Cafe.jpg"],
  muffin: ["7/7e/Chocolate_muffin_with_chocolate_chips.JPG/500px-Chocolate_muffin_with_chocolate_chips.JPG"],
  donut: ["c/c6/Donut_Selection.jpg/500px-Donut_Selection.jpg", "9/98/Donut_2.jpg/500px-Donut_2.jpg"],
  club: ["b/bd/Club-sandwich.jpg/500px-Club-sandwich.jpg"],
  ketchup: ["b/bd/Ketchup.jpg/500px-Ketchup.jpg"],
  bread: ["6/60/Flatbread_on_counter.jpg/500px-Flatbread_on_counter.jpg"],
  combo: ["9/9f/Food-pizza-slice-fast-food_%2824326247095%29.jpg/500px-Food-pizza-slice-fast-food_%2824326247095%29.jpg"],
} as const;

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const pick = (k: keyof typeof I, name: string) => {
  const l = I[k];
  return P(l[hash(name) % l.length]);
};

// Order matters: first matching rule wins.
const rules: [RegExp, keyof typeof I][] = [
  [/mojito|limonad|kivi/, "mojito"],
  [/ays ti|ice tea/, "icedtea"],
  [/pepsi|mirinda|7 up|cola/, "cola"],
  [/latte|amerikano|espresso/, "latte"],
  [/kapuchino/, "cappuccino"],
  [/choy|suv/, "tea"],
  [/muffin/, "muffin"],
  [/donat/, "donut"],
  [/sezar/, "caesar"],
  [/yunon/, "greek"],
  [/karam|koul/, "slaw"],
  [/sous|ketchup/, "ketchup"],
  [/stripslar/, "strips"],
  [/nagets/, "nuggets"],
  [/fri |fri$|kartoshka/, "fries"],
  [/^non$/, "bread"],
  [/pitsa/, "pizza"],
  [/hot-dog|hot-dogi/, "hotdog"],
  [/klub sendvich|longer/, "club"],
  [/chizburger|big burger|gamburger|burger/, "burger"],
  [/doner|haggi|pita|donner/, "doner"],
  [/lavash|shaurma|set|juft|baraka|combo/, "shawarma"],
];

export function imageFor(name: string): string | undefined {
  const n = name.toLowerCase();
  for (const [re, k] of rules) {
    if (re.test(n)) {
      if (k === "burger" && /chizburger/.test(n)) return pick("cheeseburger", name);
      return pick(k, name);
    }
  }
  return pick("combo", name);
}
