export class Games {
  constructor(
    public name: string,
    public price: number,
    public genre: string,
    public image_url: string,
    public description: string,
    public rating: number,
    public id?: number // Add an optional 'id' property
  ) {
    this.name = name;
    this.price = price;
    this.genre = genre;
    this.image_url = image_url;
    this.description = description;
    this.rating = rating;
    this.id = id;
  }
}
