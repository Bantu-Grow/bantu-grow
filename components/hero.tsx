import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRightIcon, PhoneCallIcon, Sparkles } from "lucide-react";
import { copy } from "@/content/copy";
import Link from "next/link";

function DashboardMockup() {
	return (
		<div
			aria-hidden="true"
			className="relative mx-auto mt-12 hidden w-full max-w-3xl md:block"
		>
			{/* Outer glow */}
			<div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-2xl" />

			{/* Dashboard frame */}
			<div className="relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-primary/5">
				{/* Title bar */}
				<div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5">
					<div className="flex gap-1.5">
						<div className="size-2.5 rounded-full bg-red-400/70" />
						<div className="size-2.5 rounded-full bg-yellow-400/70" />
						<div className="size-2.5 rounded-full bg-green-400/70" />
					</div>
					<div className="ml-4 h-4 w-48 rounded bg-muted/60" />
				</div>

				{/* Dashboard content */}
				<div className="grid grid-cols-12 gap-3 p-4">
					{/* Sidebar */}
					<div className="col-span-3 flex flex-col gap-2 rounded-lg border border-border/30 bg-muted/20 p-3">
						<div className="h-3 w-16 rounded bg-primary/20" />
						<div className="mt-2 h-2.5 w-full rounded bg-muted/60" />
						<div className="h-2.5 w-4/5 rounded bg-muted/40" />
						<div className="h-2.5 w-3/5 rounded bg-muted/40" />
						<div className="mt-2 h-2.5 w-full rounded bg-primary/10" />
						<div className="h-2.5 w-2/3 rounded bg-muted/40" />
					</div>

					{/* Main content area */}
					<div className="col-span-9 flex flex-col gap-3">
						{/* Stats row */}
						<div className="grid grid-cols-3 gap-3">
							<div className="rounded-lg border border-border/30 bg-gradient-to-br from-primary/5 to-transparent p-3">
								<div className="h-2 w-12 rounded bg-muted/60" />
								<div className="mt-2 h-4 w-16 rounded bg-primary/30" />
							</div>
							<div className="rounded-lg border border-border/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-3">
								<div className="h-2 w-14 rounded bg-muted/60" />
								<div className="mt-2 h-4 w-12 rounded bg-emerald-500/30" />
							</div>
							<div className="rounded-lg border border-border/30 bg-gradient-to-br from-amber-500/5 to-transparent p-3">
								<div className="h-2 w-10 rounded bg-muted/60" />
								<div className="mt-2 h-4 w-14 rounded bg-amber-500/30" />
							</div>
						</div>

						{/* Chart area */}
						<div className="rounded-lg border border-border/30 bg-muted/10 p-3">
							<div className="mb-3 h-2.5 w-20 rounded bg-muted/60" />
							{/* Bar chart mockup */}
							<div className="flex items-end gap-2 h-16">
								<div className="flex-1 rounded-t bg-primary/20 h-[40%]" />
								<div className="flex-1 rounded-t bg-primary/30 h-[65%]" />
								<div className="flex-1 rounded-t bg-primary/25 h-[50%]" />
								<div className="flex-1 rounded-t bg-primary/40 h-[80%]" />
								<div className="flex-1 rounded-t bg-primary/35 h-[70%]" />
								<div className="flex-1 rounded-t bg-primary/50 h-[90%]" />
								<div className="flex-1 rounded-t bg-primary/45 h-[75%]" />
							</div>
						</div>

						{/* Table rows */}
						<div className="rounded-lg border border-border/30 bg-muted/10 p-3">
							<div className="space-y-2">
								<div className="flex gap-3">
									<div className="h-2.5 w-1/4 rounded bg-muted/50" />
									<div className="h-2.5 w-1/3 rounded bg-muted/30" />
									<div className="h-2.5 w-1/6 rounded bg-emerald-500/20" />
								</div>
								<div className="flex gap-3">
									<div className="h-2.5 w-1/4 rounded bg-muted/50" />
									<div className="h-2.5 w-1/4 rounded bg-muted/30" />
									<div className="h-2.5 w-1/6 rounded bg-primary/20" />
								</div>
								<div className="flex gap-3">
									<div className="h-2.5 w-1/3 rounded bg-muted/50" />
									<div className="h-2.5 w-1/4 rounded bg-muted/30" />
									<div className="h-2.5 w-1/6 rounded bg-amber-500/20" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Grid pattern decoration */}
			<div className="absolute -bottom-8 -left-8 -right-8 h-16 bg-gradient-to-t from-background to-transparent" />
		</div>
	);
}

export function HeroSection() {
	return (
		<section className="relative mx-auto w-full max-w-5xl">
			{/* Top Shades */}
			<div
				aria-hidden="true"
				className="absolute inset-0 isolate hidden overflow-hidden contain-strict lg:block pointer-events-none"
			>
				<div className="absolute inset-0 -top-14 isolate -z-10 bg-[radial-gradient(35%_80%_at_49%_0%,--theme(--color-foreground/.08),transparent)] contain-strict" />
			</div>

			{/* X Bold Faded Borders */}
			<div
				aria-hidden="true"
				className="absolute inset-0 mx-auto hidden min-h-screen w-full max-w-5xl lg:block pointer-events-none"
			>
				<div className="mask-y-from-80% mask-y-to-100% absolute inset-y-0 left-0 z-10 h-full w-px bg-foreground/15" />
				<div className="mask-y-from-80% mask-y-to-100% absolute inset-y-0 right-0 z-10 h-full w-px bg-foreground/15" />
			</div>

			{/* main content */}
			<div className="relative flex flex-col items-center justify-center gap-5 pt-28 pb-20 px-4 md:px-8">
				{/* X Content Faded Borders */}
				<div
					aria-hidden="true"
					className="absolute inset-0 -z-1 size-full overflow-hidden pointer-events-none"
				>
					<div className="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-8" />
					<div className="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-8" />
					<div className="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12" />
					<div className="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12" />
				</div>

				<Link
					className={cn(
						"group mx-auto flex w-fit items-center gap-3 rounded-full border bg-card px-3 py-1 shadow transition-colors hover:bg-muted/50",
						"fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out motion-reduce:animate-none motion-reduce:transition-none"
					)}
					href="/produk"
				>
					<Sparkles className="size-3 text-primary animate-pulse motion-reduce:animate-none" />
					<span className="text-xs font-medium">Solusi Digital UMKM Indonesia</span>
					<span className="block h-5 border-l" />

					<ArrowRightIcon className="size-3 duration-150 ease-out group-hover:translate-x-1" />
				</Link>

				<h1
					className={cn(
						"fade-in slide-in-from-bottom-10 animate-in text-balance fill-mode-backwards text-center text-4xl tracking-tight font-extrabold delay-100 duration-500 ease-out md:text-5xl lg:text-6xl text-foreground motion-reduce:animate-none",
						"text-shadow-[0_0px_50px_theme(--color-foreground/.2)]"
					)}
				>
					{copy.heroHeadline}
				</h1>

				<p className="fade-in slide-in-from-bottom-10 mx-auto max-w-2xl animate-in fill-mode-backwards text-center text-base text-muted-foreground leading-relaxed delay-200 duration-500 ease-out sm:text-lg motion-reduce:animate-none">
					{copy.heroDescription}
				</p>

				<div className="fade-in slide-in-from-bottom-10 flex animate-in flex-row flex-wrap items-center justify-center gap-4 fill-mode-backwards pt-4 delay-300 duration-500 ease-out motion-reduce:animate-none">
					<Link
						href="/produk"
						className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}
					>
						Lihat Produk
						<ArrowRightIcon className="ml-1.5 h-4 w-4 shrink-0 inline-block align-middle" data-icon="inline-end" />
					</Link>
					<Link
						href="/kontak"
						className={cn(buttonVariants({ size: "lg" }), "rounded-full flex items-center justify-center")}
					>
						<PhoneCallIcon className="mr-1.5 h-4 w-4 shrink-0" data-icon="inline-start" />
						{copy.heroCta}
					</Link>
				</div>

				{/* Dashboard Mockup Illustration */}
				<DashboardMockup />
			</div>
		</section>
	);
}
