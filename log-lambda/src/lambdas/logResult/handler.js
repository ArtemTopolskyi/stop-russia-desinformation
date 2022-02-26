const main = async (event) => {
  console.log(event.body)

  return 'OK'
};

exports.main = main;