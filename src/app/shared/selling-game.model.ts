import { CurrencyPipe } from "@angular/common";

export class SellingGames {
  constructor(
    public name: string,
    public price: number | CurrencyPipe,
    public rating: number,
    public image_url: string,
    public description: string,
  ) {
    this.name = name;
    this.price = price;
    this.rating = rating;
    this.image_url = image_url;
    this.description = description;
  }
}
