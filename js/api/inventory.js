const inventoryApi = {
    async getAll() {
        return apiRequest('/inventory');
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
