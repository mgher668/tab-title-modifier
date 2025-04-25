import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { MatchType } from "../types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getUrlByMatchType(url: string, matchType: MatchType): string {
  try {
    const urlObj = new URL(url);
    
    switch (matchType) {
      case 'domain':
        return urlObj.hostname;
      case 'path':
        return urlObj.origin + urlObj.pathname;
      case 'exact':
      default:
        return url;
    }
  } catch (error) {
    console.error('Invalid URL:', error);
    return url;
  }
}

export function formatUrl(url: string, maxLength: number = 40): string {
  if (url.length <= maxLength) return url;
  
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname;
    
    if (domain.length > maxLength - 3) {
      return domain.substring(0, maxLength - 3) + '...';
    }
    
    const availableLength = maxLength - domain.length - 3;
    if (availableLength <= 0) {
      return domain + '...';
    }
    
    return domain + path.substring(0, availableLength) + '...';
  } catch (error) {
    return url.substring(0, maxLength - 3) + '...';
  }
}
