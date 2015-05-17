connection_string = 
	process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
	process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
	process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
	process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
	process.env.OPENSHIFT_APP_NAME;


module.exports = {
    // the database url to connect
    url: 'mongodb://' + connection_string
    //url: 'mongodb://localhost:27017/chartsjs'
}
