import { pgTable, serial, varchar, integer, text } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // Store price in cents/pence to avoid floating point math
  imageUrl: varchar('image_url', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
});