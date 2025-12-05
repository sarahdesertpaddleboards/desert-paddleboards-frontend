import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Music } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Shop() {
  const { data: dbProducts, isLoading } = trpc.shop.listProducts.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handlePurchase = async (productId: number) => {
    toast.info("Product checkout coming soon! For now, please contact us to purchase.");
  };

  // Use database products or show loading state
  const allProducts = dbProducts || [];
  
  // Filter products by selected category
  const products = useMemo(() => {
    if (selectedCategory === "all") return allProducts;
    return allProducts.filter((p: any) => p.category?.slug === selectedCategory);
  }, [allProducts, selectedCategory]);
  
  // Calculate category counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allProducts.length };
    allProducts.forEach((p: any) => {
      const slug = p.category?.slug || "uncategorized";
      counts[slug] = (counts[slug] || 0) + 1;
    });
    return counts;
  }, [allProducts]);
  
  // Define categories with dynamic counts
  const categories = [
    { name: "All Products", slug: "all", count: categoryCounts.all || 0 },
    { name: "Stickers", slug: "stickers", count: categoryCounts.stickers || 0 },
    { name: "Travel Guides", slug: "travel-guides", count: categoryCounts["travel-guides"] || 0 },
    { name: "Music", slug: "music", count: categoryCounts.music || 0 },
    { name: "Gift Cards", slug: "gift-cards", count: categoryCounts["gift-cards"] || 0 },
  ].filter(cat => cat.count > 0 || cat.slug === "all");

  // Placeholder products for display while loading
  const placeholderProducts = [
    {
      id: 1,
      name: "Black Canyon Paddleboarding Guide",
      category: "Travel Guides",
      price: 5,
      image: "/placeholder-guide.jpg",
      isBestseller: true,
      isDigital: true,
    },
    {
      id: 2,
      name: "Lees Ferry Adventure Guide",
      category: "Travel Guides",
      price: 5,
      image: "/placeholder-guide.jpg",
      isDigital: true,
    },
    {
      id: 3,
      name: "Life is Better on The Water - Embroidered Tote",
      category: "Merchandise",
      price: 20,
      compareAtPrice: 25,
      image: "/placeholder-tote.jpg",
      isSale: true,
    },
    {
      id: 4,
      name: "Snoop Meditation Stickers 3\"",
      category: "Merchandise",
      price: 10,
      image: "/placeholder-sticker.jpg",
      isNew: true,
    },
    {
      id: 5,
      name: "Sonoran Echoes CD",
      category: "Music",
      price: 20,
      image: "/placeholder-cd.jpg",
      isNew: true,
      description: "Native flute & soundbath album",
    },
    {
      id: 6,
      name: "Sonoran Echoes USB + Bonus tracks",
      category: "Music",
      price: 25,
      image: "/placeholder-usb.jpg",
      isNew: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-accent/20 to-secondary/10 py-16">
        <div className="container">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Shop
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Paddleboard guides, branded merchandise, and unique wellness products to enhance your water adventures
          </p>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center justify-between ${
                        selectedCategory === category.slug ? "bg-accent font-semibold" : ""
                      }`}
                    >
                      <span className="text-sm">{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Banner */}
            <Card className="mt-6 bg-primary/10">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">
                  New Release!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sonoran Echoes - Native Flute & Soundbath Album now available
                </p>
                <Button size="sm" className="w-full">
                  Shop Now
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {isLoading ? "Loading products..." : `Showing ${products.length} products`}
              </p>
              <select className="px-4 py-2 border border-input rounded-md bg-background">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No products available yet. Check back soon!</p>
                </div>
              ) : products.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-muted overflow-hidden rounded-t-lg">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          <ShoppingCart className="h-16 w-16" />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.isFeatured && (
                          <Badge className="bg-primary">Featured</Badge>
                        )}
                        {product.isDigital && (
                          <Badge className="bg-secondary">Digital</Badge>
                        )}
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <Badge variant="destructive">Sale</Badge>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">${(product.price / 100).toFixed(2)}</span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">${(product.compareAtPrice / 100).toFixed(2)}
                            ${product.compareAtPrice}
                          </span>
                        )}
                      </div>
                      {product.isDigital && (
                        <p className="text-xs text-secondary mt-1">Digital Download</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gift Cards CTA */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-16 mt-12">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Looking for the Perfect Gift?
          </h2>
          <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
            Give the gift of relaxation with a Desert Paddleboards gift certificate. Valid for any class or product!
          </p>
          <Button size="lg" variant="secondary">
            Purchase Gift Certificate
          </Button>
        </div>
      </section>
    </div>
  );
}
