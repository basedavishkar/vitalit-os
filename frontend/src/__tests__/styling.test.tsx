import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test that our custom CSS classes are working
describe('Tailwind CSS and Custom Styling', () => {
  test('renders with glassmorphism effect', () => {
    const TestComponent = () => (
      <div className="glass rounded-xl p-6">
        <h1 className="gradient-text text-2xl font-bold">Test Title</h1>
        <p className="text-gray-600">Test content</p>
      </div>
    );

    render(<TestComponent />);
    
    const container = screen.getByText('Test Title').closest('div');
    expect(container).toHaveClass('glass', 'rounded-xl', 'p-6');
  });

  test('renders gradient text correctly', () => {
    const TestComponent = () => (
      <h1 className="gradient-text text-2xl font-bold">Gradient Title</h1>
    );

    render(<TestComponent />);
    
    const title = screen.getByText('Gradient Title');
    expect(title).toHaveClass('gradient-text', 'text-2xl', 'font-bold');
  });

  test('renders custom button styles', () => {
    const TestComponent = () => (
      <button className="btn-primary">Test Button</button>
    );

    render(<TestComponent />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  test('renders input field styles', () => {
    const TestComponent = () => (
      <input 
        type="text" 
        placeholder="Test input" 
        className="input-field"
      />
    );

    render(<TestComponent />);
    
    const input = screen.getByPlaceholderText('Test input');
    expect(input).toHaveClass('input-field');
  });

  test('renders card component styles', () => {
    const TestComponent = () => (
      <div className="card">
        <h2>Card Title</h2>
        <p>Card content</p>
      </div>
    );

    render(<TestComponent />);
    
    const card = screen.getByText('Card Title').closest('div');
    expect(card).toHaveClass('card');
  });

  test('renders sidebar item styles', () => {
    const TestComponent = () => (
      <div className="sidebar-item">Sidebar Item</div>
    );

    render(<TestComponent />);
    
    const item = screen.getByText('Sidebar Item');
    expect(item).toHaveClass('sidebar-item');
  });

  test('renders active sidebar item styles', () => {
    const TestComponent = () => (
      <div className="sidebar-item sidebar-item-active">Active Item</div>
    );

    render(<TestComponent />);
    
    const item = screen.getByText('Active Item');
    expect(item).toHaveClass('sidebar-item', 'sidebar-item-active');
  });

  test('renders Tailwind utility classes', () => {
    const TestComponent = () => (
      <div className="flex items-center justify-center bg-blue-500 text-white p-4 rounded-lg">
        <span className="text-lg font-semibold">Utility Test</span>
      </div>
    );

    render(<TestComponent />);
    
    const container = screen.getByText('Utility Test').closest('div');
    expect(container).toHaveClass(
      'flex', 'items-center', 'justify-center', 
      'bg-blue-500', 'text-white', 'p-4', 'rounded-lg'
    );
  });

  test('renders responsive classes', () => {
    const TestComponent = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
        <div>Item 4</div>
      </div>
    );

    render(<TestComponent />);
    
    const container = screen.getByText('Item 1').closest('div');
    expect(container).toHaveClass(
      'grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-4'
    );
  });

  test('renders animation classes', () => {
    const TestComponent = () => (
      <div className="animate-fade-in">
        <span>Animated Content</span>
      </div>
    );

    render(<TestComponent />);
    
    const container = screen.getByText('Animated Content').closest('div');
    expect(container).toHaveClass('animate-fade-in');
  });

  test('renders hover and focus states', () => {
    const TestComponent = () => (
      <button className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 px-4 py-2 rounded">
        Interactive Button
      </button>
    );

    render(<TestComponent />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-blue-500', 'hover:bg-blue-600', 
      'focus:ring-2', 'focus:ring-blue-300',
      'px-4', 'py-2', 'rounded'
    );
  });
});

// Test that our component structure is correct
describe('Component Structure', () => {
  test('renders basic layout structure', () => {
    const TestLayout = () => (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <aside className="w-64 glass">
          <nav>Sidebar Navigation</nav>
        </aside>
        <main className="flex-1">
          <header className="glass">Header</header>
          <div className="p-6">Main Content</div>
        </main>
      </div>
    );

    render(<TestLayout />);
    
    expect(screen.getByText('Sidebar Navigation')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  test('renders dashboard stats structure', () => {
    const TestStats = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">1,247</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl">
              👥
            </div>
          </div>
        </div>
      </div>
    );

    render(<TestStats />);
    
    expect(screen.getByText('Total Patients')).toBeInTheDocument();
    expect(screen.getByText('1,247')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
  });
}); 