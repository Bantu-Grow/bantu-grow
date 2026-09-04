'use client'

import { cn } from "@/lib/utils"
import type React from "react"
import { DecorIcon } from "@/components/decor-icon"
import { Layers, Coins, Headset, Target } from "lucide-react"
import { copy } from "@/content/copy"

type FeatureType = {
	title: string
	icon: React.ReactNode
	description: string
}

export function FeatureSection() {
	const features: FeatureType[] = [
		{
			title: copy.valuePropItems[0].title,
			icon: <Layers className="size-6 text-primary mb-3" />,
			description: copy.valuePropItems[0].description,
		},
		{
			title: copy.valuePropItems[1].title,
			icon: <Coins className="size-6 text-primary mb-3" />,
			description: copy.valuePropItems[1].description,
		},
		{
			title: copy.valuePropItems[2].title,
			icon: <Headset className="size-6 text-primary mb-3" />,
			description: copy.valuePropItems[2].description,
		},
		{
			title: copy.valuePropItems[3].title,
			icon: <Target className="size-6 text-primary mb-3" />,
			description: copy.valuePropItems[3].description,
		},
	]

	return (
		<div className="mx-auto max-w-5xl px-4 md:px-8">
			<div className="text-center mb-12">
				<h2 className="font-extrabold text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">
					{copy.valuePropHeadline}
				</h2>
				<p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
					{copy.valuePropDescription}
				</p>
			</div>

			<div className="relative">
				{/* Corner Icons */}
				<DecorIcon
					className="size-6 stroke-2 stroke-border"
					position="top-left"
				/>
				<DecorIcon
					className="size-6 stroke-2 stroke-border"
					position="top-right"
				/>
				<DecorIcon
					className="size-6 stroke-2 stroke-border"
					position="bottom-left"
				/>
				<DecorIcon
					className="size-6 stroke-2 stroke-border"
					position="bottom-right"
				/>

				<DashedLine className="-top-[1.5px] right-3 left-3" />
				<DashedLine className="top-3 -right-[1.5px] bottom-3" />
				<DashedLine className="top-3 bottom-3 -left-[1.5px]" />
				<DashedLine className="right-3 -bottom-[1.5px] left-3" />

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-dashed divide-border/80">
					{features.map((feature) => (
						<div
							className="group relative p-6 md:p-8 flex flex-col items-start"
							key={feature.title}
						>
							<div className="p-2.5 bg-primary/5 rounded-lg mb-4 flex items-center justify-center border border-primary/10">
								{feature.icon}
							</div>
							<h3 className="font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

function DashedLine({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn("absolute border-collapse border border-dashed border-border/80", className)}
			{...props}
		/>
	)
}
