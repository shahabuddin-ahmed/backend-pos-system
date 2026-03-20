import { Dialect } from "sequelize";

interface SequelizeConfig {
	USERNAME: string;
	PASSWORD: string;
	POSTGRES_DATABASE: string;
}

interface SequelizeOptions {
	host: string;
	dialect: Dialect;
	pool: {
		max: number;
		min: number;
		idle: number;
	};
	define: {
		timestamps: boolean
	},
	logging: boolean;
	log: any;
}

interface Config {
	SEQUELIZE: SequelizeConfig;
	SEQUELIZEOPTIONS: SequelizeOptions;
	APPLICATION_SERVER_PORT: number;
	APP_FORCE_SHUTDOWN_SECOND: number;
}

const config: Config = {
	SEQUELIZE: {
		USERNAME: process.env.POSTGRES_USER || "root",
		PASSWORD: process.env.POSTGRES_PASSWORD || "root",
		POSTGRES_DATABASE: process.env.POSTGRES_DB || "testdb"
	},
	SEQUELIZEOPTIONS: {
		host: process.env.POSTGRES_HOST || "0.0.0.0",
		dialect: "postgres",
		pool: {
			max: 20,
			min: 5,
			idle: 10000
		},
		define: {
			timestamps: false
		},
		logging: false,
		log: console.log
	},
	APPLICATION_SERVER_PORT: Number(process.env.APPLICATION_SERVER_PORT) || 3001,
	APP_FORCE_SHUTDOWN_SECOND: Number(process.env.APP_FORCE_SHUTDOWN_SECOND) || 30,
};

export default config;
