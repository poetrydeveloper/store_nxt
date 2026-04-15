export interface ProductProps {
  id?: number;
  categoryId: number;
  brandId?: number;
  code: string;
  name: string;
  description?: string;
  mainImage?: string;
  galleryImages: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    this.props = props;
  }

  getId(): number | undefined { return this.props.id; }
  getCode(): string { return this.props.code; }
  getName(): string { return this.props.name; }
  getDescription(): string | undefined { return this.props.description; }
  getMainImage(): string | undefined { return this.props.mainImage; }
  getGalleryImages(): string[] { return [...this.props.galleryImages]; }
  getCategoryId(): number { return this.props.categoryId; }
  getBrandId(): number | undefined { return this.props.brandId; }

  async loadImagesAsync(): Promise<string[]> {
    return this.props.galleryImages;
  }

  addGalleryImage(url: string): void {
    this.props.galleryImages.push(url);
  }

  removeGalleryImage(index: number): void {
    this.props.galleryImages.splice(index, 1);
  }

  updateMainImage(url: string): void {
    this.props.mainImage = url;
  }

  updateName(name: string): void {
    this.props.name = name;
  }

  updateDescription(description: string): void {
    this.props.description = description;
  }

  toJSON(): ProductProps {
    return { ...this.props };
  }
}
