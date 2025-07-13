import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Package, Utensils, ChefHat } from 'lucide-react';
import type { Category, Menu, Extra } from '@shared/schema';

// Form schemas
const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().min(1, 'Icon is required'),
});

const menuSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required'),
  image_url: z.string().min(1, 'Image URL is required'),
  category_id: z.string().min(1, 'Category is required'),
  available: z.boolean().default(true),
});

const extraSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.string().min(1, 'Price is required'),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type MenuFormData = z.infer<typeof menuSchema>;
type ExtraFormData = z.infer<typeof extraSchema>;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('categories');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: menuItems = [] } = useQuery<Menu[]>({
    queryKey: ['/api/menu'],
  });

  const { data: extras = [] } = useQuery<Extra[]>({
    queryKey: ['/api/extras'],
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: CategoryFormData) => apiRequest('/api/categories', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: 'Category created successfully' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) => 
      apiRequest(`/api/categories/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: 'Category updated successfully' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/categories/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: 'Category deleted successfully' });
    },
  });

  // Menu mutations
  const createMenuMutation = useMutation({
    mutationFn: (data: MenuFormData) => apiRequest('/api/menu', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({ title: 'Menu item created successfully' });
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MenuFormData }) => 
      apiRequest(`/api/menu/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({ title: 'Menu item updated successfully' });
    },
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/menu/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu'] });
      toast({ title: 'Menu item deleted successfully' });
    },
  });

  // Extra mutations
  const createExtraMutation = useMutation({
    mutationFn: (data: ExtraFormData) => apiRequest('/api/extras', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/extras'] });
      toast({ title: 'Extra created successfully' });
    },
  });

  const updateExtraMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExtraFormData }) => 
      apiRequest(`/api/extras/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/extras'] });
      toast({ title: 'Extra updated successfully' });
    },
  });

  const deleteExtraMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/extras/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/extras'] });
      toast({ title: 'Extra deleted successfully' });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurant Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your restaurant's menu, categories, and extras</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              Menu Items
            </TabsTrigger>
            <TabsTrigger value="extras" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              Extras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <CategoriesTab 
              categories={categories}
              onCreateCategory={createCategoryMutation.mutate}
              onUpdateCategory={updateCategoryMutation.mutate}
              onDeleteCategory={deleteCategoryMutation.mutate}
            />
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <MenuTab 
              menuItems={menuItems}
              categories={categories}
              onCreateMenu={createMenuMutation.mutate}
              onUpdateMenu={updateMenuMutation.mutate}
              onDeleteMenu={deleteMenuMutation.mutate}
            />
          </TabsContent>

          <TabsContent value="extras" className="space-y-4">
            <ExtrasTab 
              extras={extras}
              categories={categories}
              onCreateExtra={createExtraMutation.mutate}
              onUpdateExtra={updateExtraMutation.mutate}
              onDeleteExtra={deleteExtraMutation.mutate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Categories Tab Component
function CategoriesTab({ 
  categories, 
  onCreateCategory, 
  onUpdateCategory, 
  onDeleteCategory 
}: {
  categories: Category[];
  onCreateCategory: (data: CategoryFormData) => void;
  onUpdateCategory: (params: { id: number; data: CategoryFormData }) => void;
  onDeleteCategory: (id: number) => void;
}) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      icon: '',
    },
  });

  const handleCreate = (data: CategoryFormData) => {
    onCreateCategory(data);
    form.reset();
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setValue('name', category.name);
    form.setValue('icon', category.icon);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: CategoryFormData) => {
    if (editingCategory) {
      onUpdateCategory({ id: editingCategory.id, data });
      form.reset();
      setIsEditDialogOpen(false);
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon (Emoji)</FormLabel>
                      <FormControl>
                        <Input placeholder="🍕" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Create Category</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDeleteCategory(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Emoji)</FormLabel>
                    <FormControl>
                      <Input placeholder="🍕" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Update Category</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Menu Tab Component
function MenuTab({ 
  menuItems, 
  categories, 
  onCreateMenu, 
  onUpdateMenu, 
  onDeleteMenu 
}: {
  menuItems: Menu[];
  categories: Category[];
  onCreateMenu: (data: MenuFormData) => void;
  onUpdateMenu: (params: { id: number; data: MenuFormData }) => void;
  onDeleteMenu: (id: number) => void;
}) {
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      available: true,
    },
  });

  const handleCreate = (data: MenuFormData) => {
    onCreateMenu(data);
    form.reset();
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    form.setValue('name', menu.name);
    form.setValue('description', menu.description);
    form.setValue('price', menu.price);
    form.setValue('image_url', menu.image_url);
    form.setValue('category_id', menu.category_id.toString());
    form.setValue('available', menu.available);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: MenuFormData) => {
    if (editingMenu) {
      onUpdateMenu({ id: editingMenu.id, data });
      form.reset();
      setIsEditDialogOpen(false);
      setEditingMenu(null);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Menu Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Menu item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="19.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Menu item description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Create Menu Item</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((menu) => (
          <Card key={menu.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{menu.name}</CardTitle>
                  <CardDescription className="text-sm">{getCategoryName(menu.category_id)}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(menu)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDeleteMenu(menu.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img 
                src={menu.image_url} 
                alt={menu.name}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{menu.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">${menu.price}</span>
                <Badge variant={menu.available ? "default" : "secondary"}>
                  {menu.available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Menu item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="19.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Menu item description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.icon} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Update Menu Item</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Extras Tab Component
function ExtrasTab({ 
  extras, 
  categories, 
  onCreateExtra, 
  onUpdateExtra, 
  onDeleteExtra 
}: {
  extras: Extra[];
  categories: Category[];
  onCreateExtra: (data: ExtraFormData) => void;
  onUpdateExtra: (params: { id: number; data: ExtraFormData }) => void;
  onDeleteExtra: (id: number) => void;
}) {
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<ExtraFormData>({
    resolver: zodResolver(extraSchema),
    defaultValues: {
      name: '',
      price: '',
      categories: [],
    },
  });

  const handleCreate = (data: ExtraFormData) => {
    onCreateExtra(data);
    form.reset();
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (extra: Extra) => {
    setEditingExtra(extra);
    form.setValue('name', extra.name);
    form.setValue('price', extra.price);
    form.setValue('categories', extra.categories);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (data: ExtraFormData) => {
    if (editingExtra) {
      onUpdateExtra({ id: editingExtra.id, data });
      form.reset();
      setIsEditDialogOpen(false);
      setEditingExtra(null);
    }
  };

  const getCategoryNames = (categoryIds: string[] | undefined) => {
    if (!categoryIds || !Array.isArray(categoryIds)) return '';
    return categoryIds.map(id => {
      const category = categories.find(c => c.name === id);
      return category ? category.name : id;
    }).join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Extras</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Extra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Extra</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Extra name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input placeholder="2.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categories</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <label key={category.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value.includes(category.name)}
                              onChange={(e) => {
                                const updatedCategories = e.target.checked
                                  ? [...field.value, category.name]
                                  : field.value.filter(c => c !== category.name);
                                field.onChange(updatedCategories);
                              }}
                            />
                            <span className="text-sm">{category.icon} {category.name}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Create Extra</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {extras.map((extra) => (
          <Card key={extra.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{extra.name}</CardTitle>
                  <CardDescription className="text-sm">{getCategoryNames(extra.categories)}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(extra)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDeleteExtra(extra.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">${extra.price}</span>
                <div className="flex gap-1">
                  {(extra.categories || []).map(cat => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Extra</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Extra name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="2.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={field.value.includes(category.name)}
                            onChange={(e) => {
                              const updatedCategories = e.target.checked
                                ? [...field.value, category.name]
                                : field.value.filter(c => c !== category.name);
                              field.onChange(updatedCategories);
                            }}
                          />
                          <span className="text-sm">{category.icon} {category.name}</span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Update Extra</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}