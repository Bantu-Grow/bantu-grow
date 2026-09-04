import { cn } from "@/lib/utils";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Portal, PortalBackdrop } from "@/components/portal";
import { navLinks } from "@/components/layout/Header";
import { XIcon, MenuIcon } from "lucide-react";
import Link from 'next/link';

export function MobileNav() {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label={open ? 'Tutup menu' : 'Buka menu'}
				className="md:hidden"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				{open ? (
					<XIcon className="size-4.5" />
				) : (
					<MenuIcon className="size-4.5" />
				)}
			</Button>
			{open && (
				<Portal className="top-16" id="mobile-menu">
					<PortalBackdrop />
					<nav
						aria-label="Navigasi mobile"
						className={cn(
							"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
							"size-full p-4 bg-background"
						)}
						data-slot={open ? "open" : "closed"}
					>
						<div className="grid gap-y-2">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className={cn(buttonVariants({ variant: "ghost" }), "justify-start text-base w-full py-2 px-3")}
									onClick={() => setOpen(false)}
								>
									{link.label}
								</Link>
							))}
						</div>
						<div className="mt-12 flex flex-col gap-2">
							<Link
								href="/demo"
								className={cn(buttonVariants({ variant: "default" }), "w-full text-center py-2 px-3 block")}
								onClick={() => setOpen(false)}
							>
								Minta Demo
							</Link>
						</div>
					</nav>
				</Portal>
			)}
		</div>
	);
}
