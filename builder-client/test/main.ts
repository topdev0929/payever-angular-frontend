const context = (require as any).context('../src', true, /\.spec\.ts$/);
context.keys().map(context);
