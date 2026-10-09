import type { DB } from "./types";
import { imageFor } from "./images";

type Row = [string, number, number?];
const data: { name: string; emoji: string; items: Row[] }[] = [
  { name: "Aksiyalar", emoji: "🔥", items: [["1+1 Tovuqli shaurma set", 49000, 70000], ["2 ta katta tovuqli lavash", 49000, 74000]] },
  { name: "Foydali setlar", emoji: "🎁", items: [["Pishloqli hot-dog set", 39000], ["Set «Tandir lavash»", 62000], ["Set Gamburger", 55000], ["Set «Pita doner»", 55000], ["Set «Lavashlar juftligi»", 105000], ["Set «Tandir lavash juftligi»", 109000], ["Set Lavash", 59000], ["Set «Shaurmada baraka»", 175000], ["Lavashda baraka", 199000], ["Klubli juftlik", 95000], ["Set Super Pita", 55000]] },
  { name: "Lavash", emoji: "🌯", items: [["Katta lavash", 37000], ["Mini lavash", 32000], ["Pishloqli katta lavash", 40000], ["Pishloqli mini lavash", 35000], ["Tandir lavash", 39000], ["Pishloqli tandir lavash", 42000]] },
  { name: "Tovuqli yangiliklar", emoji: "🍗", items: [["Tovuqli katta lavash", 35000], ["Tovuqli mini lavash", 29000], ["Tovuqli pita doner set", 53000], ["Tovuqli lavash set", 57000], ["Tovuqli pishloqli katta lavash", 38000], ["Tovuqli tandir lavash", 37000], ["Tovuqli big doner", 39000], ["Tovuqli pita doner", 33000], ["Tovuqli shaurma", 29000], ["Tovuqli haggi", 39000], ["Tovuqli tandir lavash jufti", 105000]] },
  { name: "Burgerlar", emoji: "🍔", items: [["Gamburger", 34000], ["Chizburger", 36000], ["Big Burger", 50000], ["Big Chizburger", 55000], ["Klub sendvich fri bilan", 42000], ["Tovuqli Longer", 27000]] },
  { name: "Donerlar", emoji: "🥙", items: [["Haggi", 41000], ["Shaurma", 31000], ["Pita doner", 35000], ["Super pita", 37000], ["Big Doner", 41000], ["Doner miks (tovuq)", 53000], ["Doner miks (mol go'shti)", 56000]] },
  { name: "Katta pitsalar", emoji: "🍕", items: [["Pitsa Assorti", 110000], ["Pitsa Pepperoni", 95000], ["Go'shtli pitsa", 120000], ["Qazili pitsa", 115000], ["Tovuqli pitsa", 100000]] },
  { name: "Hot-doglar", emoji: "🌭", items: [["Hot-dog", 19000], ["Pishloqli hot-dog", 21000], ["Qirollik hot-dogi", 28000]] },
  { name: "Gazaklar", emoji: "🍟", items: [["Fri kichik", 12000], ["Fri o'rta", 19000], ["Fri katta", 25000], ["Qishloqcha kartoshka", 19000], ["Fri gigant", 30000], ["Stripslar 3 dona", 22000], ["Stripslar 5 dona", 34000], ["Nagetslar 5 dona", 15000], ["Nagetslar 8 dona", 23000], ["Nagetslar 15 dona", 40000], ["Nagets boks", 39000], ["Non", 5000]] },
  { name: "Salatlar", emoji: "🥗", items: [["Sezar salati", 30000], ["Qizil karam salati", 10000], ["Koul slou", 10000], ["Yunon salati", 29000]] },
  { name: "Limonadlar", emoji: "🍹", items: [["Mojito kokos-ananas", 18000], ["Klassik Mojito", 18000], ["Mojito qulupnay", 18000], ["Mojito mango-marakuya", 18000], ["Ays Ti", 18000], ["Kivi-Tarxun", 18000]] },
  { name: "Ichimliklar", emoji: "🥤", items: [["Pepsi 0.3 L", 8000], ["Pepsi 0.5 L", 12000], ["Pepsi 1.5 L", 20000], ["Mirinda 0.4 L", 9000], ["7 Up 0.4 L", 9000], ["Lipton yashil choy 0.5 L", 12000], ["Imbirli choy", 16000], ["Chakanda choyi", 16000], ["Qora choy 0.3 L", 5000], ["Latte 300 ml", 17000], ["Kapuchino 300 ml", 17000], ["Amerikano 300 ml", 16000], ["Suv gazsiz 0.5 L", 6000]] },
  { name: "Souslar", emoji: "🥫", items: [["Paket", 1000], ["Achchiq-shirin chili sousi", 5000], ["Sarimsoqli sous", 5000], ["Ketchup Heinz", 5000], ["Pishloqli sous", 5000]] },
  { name: "Desertlar", emoji: "🍩", items: [["Shokoladli muffin", 20000], ["O'rmon mevali muffin", 20000], ["Yong'oqli donat", 20000], ["Karamelli donat", 20000], ["Qulupnayli donat", 20000]] },
];

export function seedDB(): DB {
  const categories: DB["categories"] = [];
  const products: DB["products"] = [];
  data.forEach((c, i) => {
    const id = `c${i + 1}`;
    categories.push({ id, name: c.name, emoji: c.emoji, order: i });
    c.items.forEach(([name, price, oldPrice0], j) => {
      const oldPrice = oldPrice0 ?? (i === 1 || i === 6 ? Math.round((price * 1.18) / 1000) * 1000 : undefined);
      products.push({ id: `p${i + 1}_${j + 1}`, categoryId: id, name, description: "", price, oldPrice, image: imageFor(name), emoji: c.emoji, active: true });
    });
  });
  const banners: DB["banners"] = [
    { id: "b1", title: "1+1", subtitle: "Ikkinchisi sovg'a! Tovuqli shaurma set 49 000 so'm", from: "#e11d2e", to: "#ff7a18", emoji: "🌯", active: true },
    { id: "b2", title: "Tandir lavash", subtitle: "Yangi ta'm — issiq, xushbo'y, to'yimli", from: "#7c1d1d", to: "#e11d2e", emoji: "🔥", active: true },
    { id: "b3", title: "Bepul yetkazish", subtitle: "100 000 so'mdan yuqori buyurtmalarga", from: "#f59e0b", to: "#e11d2e", emoji: "🛵", active: true },
  ];
  return { categories, products, banners, orders: [], seq: 1000 };
}
