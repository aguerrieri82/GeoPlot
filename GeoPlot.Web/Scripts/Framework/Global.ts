
function formatNumber(value: number) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/****************************************/

function capitalizeFirst(value: string) {
    return value.substr(0, 1).toUpperCase() + value.substr(1);
}