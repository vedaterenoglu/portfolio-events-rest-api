import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '../../src/generated/client';

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

export const createMockPrismaClient = (): MockPrismaClient => {
  return mockDeep<PrismaClient>();
};

// Default mock data
export const mockCityData = {
  citySlug: 'test-city',
  city: 'Test City',
  url: 'test-city-image.jpg',
  alt: 'Test City Image',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  events: []
};

export const mockEventData = {
  id: 1,
  name: 'Test Event',
  slug: 'test-event',
  city: 'Test City',
  citySlug: 'test-city',
  location: 'Test Location',
  date: new Date('2024-12-25'),
  organizerName: 'Test Organizer',
  imageUrl: 'test-event-image.jpg',
  alt: 'Test Event Image',
  description: 'Test event description',
  price: 100,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  cityData: mockCityData
};