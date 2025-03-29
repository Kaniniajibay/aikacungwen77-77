
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Anime } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface AnimeFormProps {
  anime?: Anime;
  isEdit?: boolean;
}

const INITIAL_STATE: Omit<Anime, 'id'> = {
  title: '',
  description: '',
  image_url: '',
  genres: [],
  release_year: new Date().getFullYear(),
  status: 'ongoing',
};

const AnimeForm = ({ anime, isEdit = false }: AnimeFormProps) => {
  const [formData, setFormData] = useState<Omit<Anime, 'id'>>({
    title: anime?.title || INITIAL_STATE.title,
    description: anime?.description || INITIAL_STATE.description,
    image_url: anime?.image_url || INITIAL_STATE.image_url,
    genres: anime?.genres || INITIAL_STATE.genres,
    release_year: anime?.release_year || INITIAL_STATE.release_year,
    status: anime?.status || INITIAL_STATE.status,
  });
  const [genreInput, setGenreInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setFormData({ ...formData, release_year: value });
    }
  };

  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData({
        ...formData,
        genres: [...formData.genres, genreInput.trim()],
      });
      setGenreInput('');
    }
  };

  const removeGenre = (genre: string) => {
    setFormData({
      ...formData,
      genres: formData.genres.filter(g => g !== genre),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.image_url || formData.genres.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and add at least one genre",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      if (isEdit && anime) {
        // Update existing anime
        const { error } = await supabase
          .from('anime')
          .update(formData)
          .eq('id', anime.id);
          
        if (error) throw error;
        
        toast({
          title: "Anime updated",
          description: "The anime has been updated successfully",
        });
      } else {
        // Insert new anime
        const { error } = await supabase
          .from('anime')
          .insert(formData);
          
        if (error) throw error;
        
        toast({
          title: "Anime added",
          description: "The anime has been added successfully",
        });
      }
      
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: isEdit ? "Update failed" : "Creation failed",
        description: error.message || "Failed to save anime data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter anime title"
              className="bg-anime-background border-anime-primary/20"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium mb-1">
              Image URL <span className="text-red-500">*</span>
            </label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Enter image URL"
              className="bg-anime-background border-anime-primary/20"
              disabled={isLoading}
              required
            />
            {formData.image_url && (
              <div className="mt-2">
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-32 h-40 object-cover rounded-md"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x450?text=Error+Loading+Image')}
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="release_year" className="block text-sm font-medium mb-1">
                Release Year <span className="text-red-500">*</span>
              </label>
              <Input
                id="release_year"
                name="release_year"
                type="number"
                value={formData.release_year}
                onChange={handleYearChange}
                min={1950}
                max={new Date().getFullYear() + 1}
                className="bg-anime-background border-anime-primary/20"
                disabled={isLoading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-anime-background border-anime-primary/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-anime-card border-anime-primary/20">
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label htmlFor="genres" className="block text-sm font-medium mb-1">
              Genres <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <Input
                id="genres"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                placeholder="Add a genre"
                className="bg-anime-background border-anime-primary/20 rounded-r-none"
                disabled={isLoading}
              />
              <Button 
                type="button" 
                onClick={addGenre}
                className="rounded-l-none bg-anime-primary hover:bg-anime-primary/90"
                disabled={isLoading || !genreInput.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.genres.map((genre, index) => (
                <div 
                  key={index}
                  className="bg-anime-primary/10 text-anime-primary px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="ml-1 text-anime-primary hover:text-anime-primary/80"
                    disabled={isLoading}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.genres.length === 0 && (
                <span className="text-xs text-anime-muted">No genres added yet</span>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter anime description"
            className="bg-anime-background border-anime-primary/20 min-h-[250px]"
            disabled={isLoading}
            required
          />
        </div>
      </div>
      
      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/admin/dashboard')}
          className="border-anime-primary/20 text-anime-text"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-anime-primary hover:bg-anime-primary/90"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : isEdit ? "Update Anime" : "Add Anime"}
        </Button>
      </div>
    </form>
  );
};

export default AnimeForm;
