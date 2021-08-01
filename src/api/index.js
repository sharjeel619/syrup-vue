const apiURL = "https://syrup-api.herokuapp.com/";
export const getStocks = async () => {
  return new Promise((resolve, reject) => {
    fetch(`${apiURL}stocks`).then(res => res.json()).then(res => resolve(res)).catch(err => reject(err));
  })
}
export const getStockInfoByName = (stock) => {
  return new Promise((resolve, reject) => {
    fetch(`${apiURL}stock?stock_name=${stock}`).then(res => res.json()).then(res => resolve(res)).catch(err => reject(err));
  })
}