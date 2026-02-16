import React from 'react';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface ModeCardProps {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  active?: boolean;
}