'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ZoomIn } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  trigger?: React.ReactNode;
  className?: string;
}

export function ImageCarousel({ 
  images, 
  trigger,
  className = '' 
}: ImageCarouselProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Cập nhật current slide khi carousel thay đổi
  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (!images || images.length === 0) {
    return null;
  }

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
    >
      <ZoomIn className="h-4 w-4 mr-2" />
      Xem ảnh ({images.length})
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={className}>
          {trigger || defaultTrigger}
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Hình ảnh phòng</DialogTitle>
        </DialogHeader>
        
        <div className="px-6 pb-6 mt-4">
          <div className="relative group">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="flex items-center justify-center bg-slate-900/5 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Ảnh phòng ${index + 1}`}
                        className="max-w-full h-auto max-h-[60vh] object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-white/20 hover:bg-white/40 border-0 text-white" />
              <CarouselNext className="right-2 bg-white/20 hover:bg-white/40 border-0 text-white" />
            </Carousel>
          </div>
          
          {images.length > 1 && (
            <div className="flex items-center justify-center mt-4 space-x-2">
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {current + 1} / {images.length}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
