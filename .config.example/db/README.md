All database migration files (in .js) go here.
All database migration files must include a .up() method, and a .down() method. A Bluebird MySQL2/Promise object is passed in to each function. 