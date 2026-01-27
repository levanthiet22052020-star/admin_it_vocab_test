const inventoryApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/inventory${query ? '?' + query : ''}`);
    },

    async getById(id) {
        throw new Error('Get inventory item by ID not supported by server API');
    },

    async create(item) {
        throw new Error('Create inventory item not supported by server API');
    },

    async update(id, item) {
        throw new Error('Update inventory item not supported by server API');
    },

    async delete(id) {
        throw new Error('Delete inventory item not supported by server API');
    },

    async useItem(itemId) {
        return apiRequest('/inventory/use', {
            method: 'POST',
            body: JSON.stringify({ itemId })
        });
    },

    async unequipSkin() {
        return apiRequest('/inventory/unequip-skin', {
            method: 'POST'
        });
    }
};
