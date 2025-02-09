export interface DateConstraint {
  max: Date;
  min: Date;
}

export class DateConstraints {

  static readonly default: DateConstraint = {
    max: DateConstraints.add(100, 'years'),
    min: DateConstraints.subtract(100, 'years'),
  };

  static readonly future: DateConstraint = {
    max: DateConstraints.add(50, 'years'),
    min: DateConstraints.add(1, 'days'),
  };

  static readonly past: DateConstraint = {
    max: DateConstraints.subtract(1, 'days'),
    min: DateConstraints.subtract(100, 'years'),
  };

  static readonly pastOrToday: DateConstraint = {
    max: new Date(),
    min: DateConstraints.subtract(100, 'years'),
  };

  static readonly adultDateOfBirth: DateConstraint = {
    max: DateConstraints.subtract(18, 'years'),
    min: DateConstraints.subtract(100, 'years'),
  };

  static readonly santanderAdultDateOfBirth: DateConstraint = {
    max: DateConstraints.subtract(18, 'years'),
    min: DateConstraints.subtract(70, 'years'),
  };

  public static shortConstraints(constraints: DateConstraint): DateConstraint {
    return {
      min: new Date(constraints.min.getFullYear(), constraints.min.getMonth()),
      max: new Date(constraints.max.getFullYear(), constraints.max.getMonth()),
    };
  }

  private static add(number: number, unit: 'years' | 'days'): Date {
    switch (unit) {
      case 'years':
        return new Date(new Date().setFullYear(new Date().getFullYear() + number));
      case 'days':
        return new Date(new Date().setDate(new Date().getDate() + number));
    }
  }

  private static subtract(number: number, unit: 'years' | 'days'): Date {
    switch (unit) {
      case 'years':
        return new Date(new Date().setFullYear(new Date().getFullYear() - number));
      case 'days':
        return new Date(new Date().setDate(new Date().getDate() - number));
    }
  }
}
