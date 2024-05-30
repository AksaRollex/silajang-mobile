import { Children } from "react";

export const If = ({ isTrue, children }: { isTrue: boolean; children: any }) =>
  isTrue ? children : null;

export const For = ({ render, each }: { render: any; each: any[] }) =>
  Children.toArray(each.map((item, index) => render(item, index)));

export const Show = ({
  isTrue,
  children,
}: {
  isTrue: boolean;
  children: any;
}) => {
  let when: any = null;
  let otherwise = null;

  Children.forEach(children, children => {
    if (children.isTrue === undefined) {
      otherwise = children;
    } else if (!when && children.isTrue === true) {
      when = children;
    }
  });

  return when || otherwise;
};

Show.When = If;
Show.Else = ({ render, children }: { render: any; children: any }) =>
  render ? render() : children;
