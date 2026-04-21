import React from "react";
import FeaturedProject from "@/components/case-study-card";
import { SectionLayoutProps } from "./shared";

const FeatureAlternatingLayout = ({ items }: SectionLayoutProps) => (
  <div className="space-y-32">
    {items.map((item, index) => <FeaturedProject key={item.id} project={item} index={index} />)}
  </div>
);

export default FeatureAlternatingLayout;
