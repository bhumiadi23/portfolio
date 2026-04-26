/**
 * useCompare — backwards-compatible re-export that delegates to the
 * global CompareContext. All pages/components that already import
 * from this hook will automatically share the same compare list.
 */
export { useCompareContext as useCompare } from '../context/CompareContext'
