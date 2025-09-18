"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Clock, TrendingUp, Package, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'tracking' | 'sender' | 'receiver';
  count?: number;
  icon?: React.ReactNode;
}

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchSuggestions({ 
  value, 
  onChange, 
  onSearch, 
  placeholder = "Search shipments...",
  className 
}: SearchSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mock suggestions data - in real app, this would come from API
  const mockSuggestions: SearchSuggestion[] = [
    // Recent searches
    { id: 'recent-1', text: 'TRK123456789', type: 'recent', icon: <Clock className="h-3 w-3" /> },
    { id: 'recent-2', text: 'John Smith', type: 'recent', icon: <Package className="h-3 w-3" /> },
    { id: 'recent-3', text: 'Amazon Inc', type: 'recent', icon: <Package className="h-3 w-3" /> },
    
    // Popular searches
    { id: 'popular-1', text: 'DELIVERED', type: 'popular', count: 1247, icon: <TrendingUp className="h-3 w-3" /> },
    { id: 'popular-2', text: 'IN_TRANSIT', type: 'popular', count: 892, icon: <TrendingUp className="h-3 w-3" /> },
    { id: 'popular-3', text: 'PENDING', type: 'popular', count: 456, icon: <TrendingUp className="h-3 w-3" /> },
    
    // Tracking numbers
    { id: 'tracking-1', text: 'TRK987654321', type: 'tracking' },
    { id: 'tracking-2', text: 'TRK456789123', type: 'tracking' },
    
    // Senders
    { id: 'sender-1', text: 'Microsoft Corp', type: 'sender' },
    { id: 'sender-2', text: 'Google LLC', type: 'sender' },
    
    // Receivers
    { id: 'receiver-1', text: 'Apple Inc', type: 'receiver' },
    { id: 'receiver-2', text: 'Tesla Motors', type: 'receiver' },
  ];

  useEffect(() => {
    if (value.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
      setIsOpen(true);
    } else {
      // Show recent and popular when no input
      const recentAndPopular = mockSuggestions.filter(s => 
        s.type === 'recent' || s.type === 'popular'
      );
      setSuggestions(recentAndPopular.slice(0, 6));
      setIsOpen(true);
    }
    setSelectedIndex(-1);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const selectedSuggestion = suggestions[selectedIndex];
          onChange(selectedSuggestion.text);
          onSearch(selectedSuggestion.text);
          setIsOpen(false);
        } else {
          onSearch(value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    onSearch(suggestion.text);
    setIsOpen(false);
  };

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon;
    
    switch (suggestion.type) {
      case 'tracking':
        return <Package className="h-3 w-3" />;
      case 'sender':
        return <MapPin className="h-3 w-3" />;
      case 'receiver':
        return <MapPin className="h-3 w-3" />;
      default:
        return <Search className="h-3 w-3" />;
    }
  };

  const getSuggestionLabel = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'recent':
        return 'Recent';
      case 'popular':
        return 'Popular';
      case 'tracking':
        return 'Tracking';
      case 'sender':
        return 'Sender';
      case 'receiver':
        return 'Receiver';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className={cn("pl-10", className)}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto shadow-lg border"
        >
          <CardContent className="p-2">
            <div className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={suggestion.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "w-full justify-start h-auto p-2 text-left",
                    selectedIndex === index && "bg-blue-50"
                  )}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex-shrink-0 text-gray-400">
                      {getSuggestionIcon(suggestion)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium truncate">
                          {suggestion.text}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className="text-xs px-1 py-0 h-4"
                        >
                          {getSuggestionLabel(suggestion)}
                        </Badge>
                        {suggestion.count && (
                          <Badge 
                            variant="outline" 
                            className="text-xs px-1 py-0 h-4"
                          >
                            {suggestion.count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
