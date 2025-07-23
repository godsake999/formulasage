import * as React from 'react';
import Image, { ImageProps } from 'next/image';
import { Maximize2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ZoomImageProps extends ImageProps {
  iconClassName?: string;
  containerClassName?: string;
}

export function ZoomImage({ iconClassName, containerClassName, ...props }: ZoomImageProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div
        className={cn(
          'group relative cursor-zoom-in transition-all aspect-video bg-muted',
          containerClassName
        )}
        tabIndex={0}
        aria-label="Zoom image"
      >
        {props.src ? (
          <Image
            {...props}
            fill
            className={cn('object-cover w-full h-full', props.className)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
            No image
          </div>
        )}
        <button
          type="button"
          className={cn(
            'absolute right-2 bottom-2 z-10 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity',
            iconClassName
          )}
          onClick={() => setOpen(true)}
          tabIndex={-1}
          aria-label="Zoom"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none flex items-center justify-center">
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">Zoomed image</DialogTitle>
          <div className="relative w-full h-[60vh]">
            <Image {...props} fill className="object-contain rounded-lg" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
