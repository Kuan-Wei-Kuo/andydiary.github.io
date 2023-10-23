---
title: BeanUtils.copyProperties 為什麼慢
date: "2023-10-23T00:00:00Z"
tags: ['Loadbalance','Webscoket']
---

長久以來使用 ModelMapper、MapStruct 進行對象屬性的 Copy，在某次專案的情境下，剛好用到了 BeanUtils.copyProperties，當然也很幸運地遇到效能問題，因此我也不禁好奇，都是映射工具，怎麼速度上的差異如此之大。

## 看看原始碼
```java
public abstract class BeanUtils {
    ...
    private static void copyProperties(Object source, Object target, @Nullable Class<?> editable,
			@Nullable String... ignoreProperties) throws BeansException {

		Assert.notNull(source, "Source must not be null");
		Assert.notNull(target, "Target must not be null");

		Class<?> actualEditable = target.getClass();
		if (editable != null) {
			if (!editable.isInstance(target)) {
				throw new IllegalArgumentException("Target class [" + target.getClass().getName() +
						"] not assignable to Editable class [" + editable.getName() + "]");
			}
			actualEditable = editable;
		}
        // 取得屬性以及set、get方法
		PropertyDescriptor[] targetPds = getPropertyDescriptors(actualEditable);
		Set<String> ignoredProps = (ignoreProperties != null ? new HashSet<>(Arrays.asList(ignoreProperties)) : null);

		for (PropertyDescriptor targetPd : targetPds) {
            // 取得set方法
			Method writeMethod = targetPd.getWriteMethod();
			if (writeMethod != null && (ignoredProps == null || !ignoredProps.contains(targetPd.getName()))) {
				PropertyDescriptor sourcePd = getPropertyDescriptor(source.getClass(), targetPd.getName());
				if (sourcePd != null) {
                    // 取得get方法
					Method readMethod = sourcePd.getReadMethod();
					if (readMethod != null) {
						ResolvableType sourceResolvableType = ResolvableType.forMethodReturnType(readMethod);
						ResolvableType targetResolvableType = ResolvableType.forMethodParameter(writeMethod, 0);

						// Ignore generic types in assignable check if either ResolvableType has unresolvable generics.
						boolean isAssignable =
								(sourceResolvableType.hasUnresolvableGenerics() || targetResolvableType.hasUnresolvableGenerics() ?
										ClassUtils.isAssignable(writeMethod.getParameterTypes()[0], readMethod.getReturnType()) :
										targetResolvableType.isAssignableFrom(sourceResolvableType));

						if (isAssignable) {
							try {
								if (!Modifier.isPublic(readMethod.getDeclaringClass().getModifiers())) {
									readMethod.setAccessible(true);
								}
                                // 通過反射調用get方法，取得來源屬性值
								Object value = readMethod.invoke(source);
								if (!Modifier.isPublic(writeMethod.getDeclaringClass().getModifiers())) {
									writeMethod.setAccessible(true);
								}
                                // 通過反射調用set方法，設定目標屬性值
								writeMethod.invoke(target, value);
							}
							catch (Throwable ex) {
								throw new FatalBeanException(
										"Could not copy property '" + targetPd.getName() + "' from source to target", ex);
							}
						}
					}
				}
			}
		}
	}
    ...
}
```
簡單的看看原始碼，網路上已經有很多大神的解析，我們應該只要稍微順過一下，首先我們會取得所有目標的屬性資料，之後進行迴圈並且使用反射對目標與來源進行數值的取得與設定。

拋開這些檢查不說，反射就是一個問題來源。

## 反射是不是很慢
是，在 Java17 以前確實存在效能議題，但這個議題是可見的，詳細資訊可看此文章([The performance implications of Java reflection](https://blogs.oracle.com/javamagazine/post/java-reflection-performance))。

由上述文章說明的反射議題，我們可以來測試看看，反射與直接進行Set還慢。

```java
public class Call {
    
    public static void main(String[] args) throws Exception {
        org.openjdk.jmh.Main.main(args);
    }

    @Benchmark
    @Fork(value = 1, warmups = -1)
    @OutputTimeUnit(TimeUnit.NANOSECONDS)
    @BenchmarkMode(Mode.AverageTime)
    public void directCall() {
        Person source = new Person("John", "Doe", 50);
        Person target = new Person();
        target.setFirstName(source.getFirstName());
        target.setLastName(source.getLastName());
        target.setAge(source.getAge());
    }

    @Benchmark
    @Fork(value = 1, warmups = -1)
    @OutputTimeUnit(TimeUnit.NANOSECONDS)
    @BenchmarkMode(Mode.AverageTime)
    public void reflectiveCall() throws InvocationTargetException, NoSuchMethodException, IllegalAccessException, IntrospectionException {
        Person source = new Person("John", "Doe", 50);
        Person target = new Person();

        BeanInfo beanInfo = Introspector.getBeanInfo(Person.class);
        PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
        for(PropertyDescriptor propertyDescriptor : propertyDescriptors) {
            Method readMethod = propertyDescriptor.getReadMethod();           
            Method writeMethod = propertyDescriptor.getWriteMethod();
            if(writeMethod != null) {
                Object value = readMethod.invoke(source);
                writeMethod.invoke(target, value);
            }
        }
    }

}
```

我們利用 Beanchmark 來檢視效能到底如何。
```
Benchmark            Mode  Cnt    Score   Error  Units
Call.directCall      avgt    5    0.364 ± 0.043  ns/op
Call.reflectiveCall  avgt    5  104.245 ± 3.031  ns/op
```

搭配上述的文章，我們可以合理的推斷，確實 BeanUtils.copyProperties 效能與反射使用有關，可能有能會說 BeanUtils 也有進行緩存 Method，讓取得 Method 更加快速，我相信也確實有所幫助。

反過來說，如果今天沒有這一層緩存，BeanUtils.copyProperties 大概會慢到烏龜跑贏兔子了，更何況大量資料，當然這次僅僅是安迪透過原始碼以及網路上文章進行的一個測試所得到的結論。

## 結論
結論就是安迪我又乖乖地切回到使用 MapStruct，果然效能又提升了上去，因為 MapStruct 並沒有使用反射而是透過方法來直接進行調用，速度也快上不少，當然 MapStruct 也是有一些雷需要踩，這邊就不加以贅述了。

安迪這次文章邊喝酒邊寫，人生就是這樣，頭暈也要搞些心得與實驗，關於 BeanUtil.copyProperties 的效能議題，國外大大都有很深入的說明，大家有興趣可以自己爬來看看。