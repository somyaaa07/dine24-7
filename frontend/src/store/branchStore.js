import { create } from 'zustand';

const useBranchStore = create((set, get) => ({
  branches:          [],
  selectedBranchId:  localStorage.getItem('selected_branch_id') || '',
  loading:           false,

  fetchBranches: async () => {
    set({ loading: true });
    try {
      const { default: api } = await import('../api');
      const res = await api.get('/branches');
      const branches = res.data.data || [];
      set({ branches, loading: false });

      // If nothing selected yet (or the saved selection no longer exists),
      // default to the main branch so pages have something to filter by.
      const current = get().selectedBranchId;
      const stillValid = branches.some(b => b.id === current);
      if (!stillValid) {
        const main = branches.find(b => b.is_main) || branches[0];
        if (main) get().setSelectedBranchId(main.id);
      }
    } catch (e) {
      console.error('Failed to fetch branches', e);
      set({ loading: false });
    }
  },

  setSelectedBranchId: (id) => {
    localStorage.setItem('selected_branch_id', id);
    set({ selectedBranchId: id });
  }
}));

export default useBranchStore;