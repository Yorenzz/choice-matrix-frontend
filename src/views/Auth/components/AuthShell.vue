<script setup lang="ts">
import BlurText from '@/components/bits/BlurText/BlurText.vue'
import ShinyText from '@/components/bits/ShinyText/ShinyText.vue'

defineProps<{
  eyebrow: string
  title: string
  description: string
  compact?: boolean
}>()
</script>

<template>
  <section class="auth-shell" :class="{ 'auth-shell--compact': compact }">
    <div class="auth-shell__backdrop">
      <div class="auth-shell__mesh" />
      <div class="auth-shell__spotlight auth-shell__spotlight--one" />
      <div class="auth-shell__spotlight auth-shell__spotlight--two" />
      <div class="auth-shell__orb auth-shell__orb--indigo" />
      <div class="auth-shell__orb auth-shell__orb--amber" />
      <div class="auth-shell__orb auth-shell__orb--teal" />
      <div class="auth-shell__grain" />
    </div>

    <div class="auth-shell__content">
      <div class="auth-shell__hero auth-shell__fade auth-shell__fade--slow">
        <div class="auth-shell__hero-top">
          <slot name="brand" />

          <div class="auth-shell__copy">
            <div class="auth-shell__eyebrow">
              <ShinyText
                :text="eyebrow"
                class-name="auth-shell__eyebrow-text"
                color="#5b6475"
                shine-color="#0f172a"
                :speed="3.2"
              />
            </div>

            <BlurText
              :text="title"
              class-name="auth-shell__title"
              animate-by="words"
              direction="top"
              :delay="90"
            />

            <p class="auth-shell__description">
              {{ description }}
            </p>
          </div>
        </div>

        <div class="auth-shell__feature-list">
          <div class="auth-shell__feature auth-shell__fade">
            <span class="auth-shell__feature-dot" />
            <div>
              <p class="auth-shell__feature-title">
                加权决策矩阵
              </p>
              <p class="auth-shell__feature-text">
                把零散条件整理成可比较、可排序、可解释的选择结构。
              </p>
            </div>
          </div>
          <div class="auth-shell__feature auth-shell__fade auth-shell__fade--delay">
            <span class="auth-shell__feature-dot" />
            <div>
              <p class="auth-shell__feature-title">
                AI 总结视角
              </p>
              <p class="auth-shell__feature-text">
                快速看懂每个选项的优势、风险和更适合你的使用场景。
              </p>
            </div>
          </div>
          <div class="auth-shell__feature auth-shell__fade auth-shell__fade--later">
            <span class="auth-shell__feature-dot" />
            <div>
              <p class="auth-shell__feature-title">
                个人工作台
              </p>
              <p class="auth-shell__feature-text">
                不是模板化后台，而是围绕你的真实决策过程来组织信息。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-shell__panel auth-shell__fade auth-shell__fade--later">
        <slot />
      </div>
    </div>
  </section>
</template>
