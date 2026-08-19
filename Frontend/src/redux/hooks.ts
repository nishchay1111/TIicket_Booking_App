import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store'; 

/**
 * Custom hook wrapper that returns a strongly-typed dispatch function 
 * pre-bound to the application's global AppDispatch middleware configuration.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Pre-typed hook variant of useSelector bound directly to the global RootState schema, 
 * eliminating the need to manually declare state typings across individual selectors.
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;