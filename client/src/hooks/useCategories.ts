import { useCallback } from 'react';
import { Category, TransactionType } from '@/types';

// Predefined categories
const categories: Category[] = [
  // Income categories
  {
    id: 'salary',
    name: 'Salary',
    nameHe: 'משכורת',
    icon: 'account_balance',
    type: 'income'
  },
  {
    id: 'freelance',
    name: 'Freelance',
    nameHe: 'עבודה חופשית',
    icon: 'work',
    type: 'income'
  },
  {
    id: 'investments',
    name: 'Investments',
    nameHe: 'השקעות',
    icon: 'trending_up',
    type: 'income'
  },
  {
    id: 'gifts',
    name: 'Gifts',
    nameHe: 'מתנות',
    icon: 'card_giftcard',
    type: 'income'
  },
  // Expense categories
  {
    id: 'food',
    name: 'Food & Groceries',
    nameHe: 'מזון וסופרמרקט',
    icon: 'restaurant',
    type: 'expense'
  },
  {
    id: 'housing',
    name: 'Housing',
    nameHe: 'דיור',
    icon: 'home',
    type: 'expense'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    nameHe: 'תחבורה',
    icon: 'directions_car',
    type: 'expense'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    nameHe: 'בידור',
    icon: 'sports_esports',
    type: 'expense'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    nameHe: 'קניות',
    icon: 'shopping_bag',
    type: 'expense'
  },
  {
    id: 'health',
    name: 'Health',
    nameHe: 'בריאות',
    icon: 'favorite',
    type: 'expense'
  },
  {
    id: 'education',
    name: 'Education',
    nameHe: 'חינוך',
    icon: 'school',
    type: 'expense'
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    nameHe: 'חשבונות',
    icon: 'receipt',
    type: 'expense'
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    nameHe: 'מנויים',
    icon: 'subscriptions',
    type: 'expense'
  }
];

export const useCategories = () => {
  // Get all categories
  const getAllCategories = useCallback(() => {
    return categories;
  }, []);
  
  // Get categories filtered by type
  const getCategories = useCallback((type?: TransactionType) => {
    if (!type) return categories;
    return categories.filter(category => category.type === type);
  }, []);
  
  // Get a category by ID
  const getCategoryById = useCallback((categoryId?: string) => {
    if (!categoryId) return undefined;
    return categories.find(cat => cat.id === categoryId);
  }, []);
  
  return {
    getAllCategories,
    getCategories,
    getCategoryById
  };
};
