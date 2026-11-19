import type React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const LogoIcon = ({ className, imageSizes = '20px', ...props }: React.ComponentProps<"span"> & { imageSizes?: string }) => (
	<span {...props} className={cn('relative inline-block size-5 select-none align-middle', className)}>
		<Image
			src="/logo.png"
			alt="BantuGrow Icon"
			fill
			sizes={imageSizes}
			className="size-full object-contain"
		/>
	</span>
);

export const Logo = ({ className, variant = 'default', ...props }: React.ComponentProps<"div"> & { variant?: 'default' | 'footer' }) => (
	<div
		className={cn('flex items-center gap-2 font-sans text-base font-extrabold tracking-tight text-foreground select-none', variant === 'footer' && 'gap-[0.5em] text-[clamp(1.75rem,10vw,9rem)] text-background opacity-60', className)}
		{...props}
		aria-label={variant === 'default' ? 'BantuGrow' : undefined}
		aria-hidden={variant === 'footer' ? true : undefined}
	>
		{variant === 'default' && <span className="sr-only">BantuGrow</span>}
		<div className={cn('relative size-6 shrink-0', variant === 'footer' && 'size-[1.5em]')} aria-hidden="true">
			<Image
				src="/logo.png"
				alt=""
				fill
				sizes={variant === 'footer' ? '(max-width: 1440px) 15vw, 216px' : '24px'}
				className={cn('object-contain', variant === 'footer' && 'brightness-0 invert')}
			/>
		</div>
		<span aria-hidden="true">Bantu<span className={variant === 'footer' ? 'text-background' : 'text-primary'}>Grow</span></span>
	</div>
);
